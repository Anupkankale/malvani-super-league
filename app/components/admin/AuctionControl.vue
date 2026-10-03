<script setup lang="ts">
import type { Auction, Team } from '#shared/utils/league'

const { store, auction, players, teams, stats, settings, isLive } = useLeague()

const player = computed(() => (isLive.value ? players.value.find((p) => p.id === auction.value.playerId) : null))
const pool = computed(() =>
  players.value.filter((p) => p.status === 'approved').sort((a, b) => a.name.localeCompare(b.name)),
)
const unsold = computed(() => players.value.filter((p) => p.status === 'unsold'))
const leader = computed(() => teams.value.find((t) => t.id === auction.value.leader))

const pick = ref('')
const msg = ref('')
const custom = ref('')

const base = computed(() => (player.value ? Number(player.value.basePrice || settings.value.basePrice) : 0))
const autoNext = computed(() => {
  if (!isLive.value) return 0
  const cur = auction.value.currentBid
  return cur == null ? base.value : cur + Number(settings.value.increment)
})
// A typed figure overrides the default next bid until the next bid lands.
const amount = computed(() => (custom.value !== '' ? Number(custom.value) : autoNext.value))
watch([() => auction.value.currentBid, () => auction.value.playerId], () => (custom.value = ''))

const nextBidValue = computed(() => (custom.value === '' ? String(autoNext.value) : custom.value))
function onNextInput(e: Event) {
  const input = e.target as HTMLInputElement
  custom.value = input.value.replace(/\D/g, '')
  input.value = nextBidValue.value // keep the field digits-only even when the value didn't change
}

const write = (a: Auction) =>
  store.set('meta', 'auction', a).catch(() => {
    msg.value = "The auction didn't update. Check your connection and try again."
  })

function start(id: string) {
  if (!id) return
  write({
    status: 'live',
    playerId: id,
    currentBid: null,
    leader: null,
    history: [],
    startedAt: Date.now(),
    lastResult: auction.value.lastResult || null,
  })
  pick.value = ''
}

function random() {
  if (pool.value.length) start(pool.value[Math.floor(Math.random() * pool.value.length)]!.id)
}

function bid(team: Team) {
  write({
    ...auction.value,
    currentBid: amount.value,
    leader: team.id,
    history: [...(auction.value.history || []), { teamId: team.id, amount: amount.value, at: Date.now() }],
  })
}

function undo() {
  const h = (auction.value.history || []).slice(0, -1)
  const lb = h[h.length - 1]
  write({ ...auction.value, history: h, currentBid: lb ? lb.amount : null, leader: lb ? lb.teamId : null })
}

async function sold() {
  const a = auction.value
  const id = player.value!.id
  await store.update('players', id, { status: 'sold', soldTo: a.leader, soldPrice: a.currentBid, soldAt: Date.now() })
  write({
    status: 'idle',
    lastResult: { playerId: id, teamId: a.leader!, amount: a.currentBid!, result: 'sold', at: Date.now() },
  })
}

async function markUnsold() {
  const id = player.value!.id
  await store.update('players', id, { status: 'unsold' })
  write({ status: 'idle', lastResult: { playerId: id, result: 'unsold', at: Date.now() } })
}

const cancel = () => write({ status: 'idle', lastResult: auction.value.lastResult || null })

function reasonFor(team: Team, left: number, count: number) {
  const cur = auction.value.currentBid
  const tooLow = cur != null ? amount.value <= cur : amount.value < base.value
  if (team.id === auction.value.leader) return 'Holding bid'
  if (count >= settings.value.maxSquad) return 'Squad full'
  if (left < amount.value) return 'Not enough purse'
  if (tooLow) return 'Raise the amount'
  return ''
}
</script>

<template>
  <div v-if="!isLive || !player" class="stack">
    <div class="panel">
      <h3>Put a player under the hammer</h3>
      <div v-if="pool.length" class="toolbar" style="margin-bottom: 0">
        <select id="ad-pick" v-model="pick" class="search" aria-label="Choose player">
          <option value="">Choose from {{ pool.length }} available players</option>
          <option v-for="p in pool" :key="p.id" :value="p.id">{{ p.name }} ({{ p.role }}, base {{ p.basePrice }})</option>
        </select>
        <button class="btn primary" :disabled="!pick" @click="start(pick)">Start bidding</button>
        <button class="btn" @click="random">Pick at random</button>
      </div>
      <div v-else class="empty">
        No players in the pool. Approve registrations in the Players tab, or bring back unsold players below.
      </div>
      <p v-if="msg" class="err" style="margin-top: 10px">{{ msg }}</p>
    </div>
    <div v-if="unsold.length" class="panel">
      <h3>Unsold ({{ unsold.length }})</h3>
      <ul class="rows">
        <li v-for="p in unsold" :key="p.id" class="row">
          <span>{{ p.name }} <span class="faint">{{ p.role }}</span></span>
          <button class="btn sm" @click="store.update('players', p.id, { status: 'approved' })">Return to pool</button>
        </li>
      </ul>
    </div>
    <AuctionArena />
  </div>

  <div v-else class="stack">
    <AuctionArena />
    <div class="panel">
      <div class="next-bid">
        <FormField id="ad-next" label="Next bid amount" :hint="`Default ${fmt(autoNext)}. Type a figure to jump.`">
          <input id="ad-next" :value="nextBidValue" inputmode="numeric" @input="onNextInput" />
        </FormField>
      </div>
      <div class="bid-grid">
        <button
          v-for="{ team, left, count } in stats"
          :key="team.id"
          class="bid-btn"
          :style="{ '--team': team.color }"
          :disabled="!!reasonFor(team, left, count)"
          @click="bid(team)"
        >
          <span class="bid-team">{{ team.short }}</span>
          <span class="bid-sub">{{ reasonFor(team, left, count) || 'Bid ' + fmt(amount) }}</span>
          <span class="bid-purse">{{ fmt(left) }} left</span>
        </button>
      </div>
      <div class="actions">
        <button class="btn gold" :disabled="!auction.leader" @click="sold">
          Sold{{ leader ? ' to ' + leader.short : '' }}
        </button>
        <button class="btn" :disabled="!(auction.history || []).length" @click="undo">Undo last bid</button>
        <ConfirmButton label="Mark unsold" btn-class="btn" @confirm="markUnsold" />
        <ConfirmButton label="Cancel, back to pool" btn-class="btn ghost danger" @confirm="cancel" />
      </div>
      <p v-if="msg" class="err" style="margin-top: 10px">{{ msg }}</p>
    </div>
  </div>
</template>
