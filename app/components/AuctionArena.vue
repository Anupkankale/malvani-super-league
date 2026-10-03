<script setup lang="ts">
import { gsap } from 'gsap'

const { auction, players, teams, settings, isLive } = useLeague()
const amt = ref<HTMLElement | null>(null)
const stamp = ref<HTMLElement | null>(null)

const player = computed(() => (isLive.value ? players.value.find((p) => p.id === auction.value.playerId) : null))
const leader = computed(() => (isLive.value ? teams.value.find((t) => t.id === auction.value.leader) : null))
const last = computed(() => auction.value.lastResult)
const lastPlayer = computed(() => last.value && players.value.find((p) => p.id === last.value!.playerId))
const lastTeam = computed(() => last.value && teams.value.find((t) => t.id === last.value!.teamId))
const earlierBids = computed(() => (auction.value.history || []).slice(-7, -1).reverse())

// Pop the amount on every new bid, and slam the SOLD/UNSOLD stamp on each result.
function popAmount() {
  if (amt.value && !REDUCED)
    gsap.fromTo(amt.value, { scale: 1.12, color: '#FFF3D1' }, { scale: 1, color: '#F4B942', duration: 0.5, ease: 'back.out(3)' })
}
function slamStamp() {
  if (stamp.value && !REDUCED)
    gsap.fromTo(
      stamp.value,
      { scale: 2.4, rotation: -24, opacity: 0 },
      { scale: 1, rotation: -10, opacity: 1, duration: 0.55, ease: 'back.out(2)' },
    )
}
onMounted(() => {
  popAmount()
  slamStamp()
})
watch([() => auction.value.currentBid, () => auction.value.playerId], popAmount, { flush: 'post' })
watch([() => last.value?.at, isLive], slamStamp, { flush: 'post' })
</script>

<template>
  <section v-if="player" class="arena" aria-live="polite">
    <div class="arena-top">
      <span class="lot"><i />On the block</span>
      <span class="arena-base">
        Base {{ fmt(player.basePrice) }} {{ settings.unit }}, +{{ fmt(settings.increment) }} per bid
      </span>
    </div>
    <div class="arena-grid">
      <div class="lot-player">
        <img v-if="player.photo" class="lot-photo" :src="player.photo" :alt="player.name" />
        <div>
          <h2 class="p-name">{{ player.name }}</h2>
          <div class="p-meta">
            <span class="tag">{{ player.role }}</span>
            <span class="tag">{{ player.battingStyle }} bat</span>
            <span v-if="player.bowlingStyle && player.bowlingStyle !== `Doesn't bowl`" class="tag">{{ player.bowlingStyle }}</span>
            <span class="tag">{{ player.age }} yrs</span>
          </div>
        </div>
      </div>
      <div class="bid-box">
        <div class="bid-lbl">{{ auction.currentBid == null ? 'Opening bid' : 'Current bid' }}</div>
        <div ref="amt" class="bid-amt">
          {{ fmt(auction.currentBid == null ? player.basePrice : auction.currentBid) }}<small>{{ settings.unit }}</small>
        </div>
        <div class="bid-lead">
          <template v-if="leader">Held by <TeamChip :team="leader" big /></template>
          <span v-else class="muted">Waiting for the first paddle</span>
        </div>
      </div>
    </div>
    <ol v-if="(auction.history?.length || 0) > 1" class="hist" aria-label="Earlier bids">
      <li v-for="(h, i) in earlierBids" :key="i">
        {{ teams.find((x) => x.id === h.teamId)?.short ?? '?' }} {{ fmt(h.amount) }}
      </li>
    </ol>
  </section>

  <section v-else class="arena idle" aria-live="polite">
    <template v-if="last && lastPlayer">
      <div class="arena-top"><span class="tag">Last player</span></div>
      <div class="arena-grid">
        <div class="lot-player">
          <img v-if="lastPlayer.photo" class="lot-photo sm" :src="lastPlayer.photo" :alt="lastPlayer.name" />
          <div>
            <h2 class="p-name">{{ lastPlayer.name }}</h2>
            <div class="p-meta">
              <span class="tag">{{ lastPlayer.role }}</span>
              <span class="tag">{{ lastPlayer.battingStyle }} bat</span>
            </div>
          </div>
        </div>
        <div v-if="last.result === 'sold'" class="bid-box">
          <div class="bid-lbl">Sold for</div>
          <div class="bid-amt">{{ fmt(last.amount) }}<small>{{ settings.unit }}</small></div>
          <div class="bid-lead">to <TeamChip :team="lastTeam" big /></div>
        </div>
        <div v-else class="bid-box">
          <div class="bid-lbl">No team bid</div>
          <div class="bid-amt" style="color: var(--chalk-dim)">—</div>
        </div>
      </div>
      <div ref="stamp" class="stamp" :class="{ unsold: last.result !== 'sold' }" aria-hidden="true">
        {{ last.result === 'sold' ? 'SOLD' : 'UNSOLD' }}
      </div>
      <p class="muted" style="margin-top: 16px">
        The next player appears here as soon as the auctioneer starts bidding.
      </p>
    </template>
    <template v-else>
      <span class="tag">Waiting for the first lot</span>
      <h2 class="p-name" style="margin-top: 16px">The auction hasn't started yet</h2>
      <p class="muted" style="margin-top: 12px; max-width: 48ch">
        {{ settings.auctionDate ? 'Auction night: ' + settings.auctionDate + '. ' : '' }}Players appear here the moment
        bidding opens, and this page updates by itself.
      </p>
    </template>
  </section>
</template>
