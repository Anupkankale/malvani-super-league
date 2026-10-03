<script setup lang="ts">
import type { Player } from '#shared/utils/league'

const { store, players, teams, settings } = useLeague()
const filter = ref('pending')
const q = ref('')
const adding = ref(false)
const FILTERS = ['pending', 'approved', 'sold', 'unsold', 'rejected', 'all']

const counts = computed(() => {
  const c: Record<string, number> = { all: players.value.length }
  players.value.forEach((p) => (c[p.status] = (c[p.status] || 0) + 1))
  return c
})
const list = computed(() =>
  players.value
    .filter((p) => filter.value === 'all' || p.status === filter.value)
    .filter((p) => (p.name + p.mobile + p.regNo).toLowerCase().includes(q.value.toLowerCase()))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)),
)

const up = (p: Player, patch: Partial<Player>) => store.update('players', p.id, patch)
const approveAll = () => players.value.filter((p) => p.status === 'pending').forEach((p) => up(p, { status: 'approved' }))
const release = (p: Player) => up(p, { status: 'approved', soldTo: null, soldPrice: null, soldAt: null })

function saveBasePrice(p: Player, e: Event) {
  const v = Number((e.target as HTMLInputElement).value)
  if (v > 0 && v !== p.basePrice) up(p, { basePrice: v })
}
</script>

<template>
  <div class="stack">
    <div class="panel">
      <div class="toolbar">
        <input id="ap-search" v-model="q" class="search" placeholder="Search name, mobile or reg no." aria-label="Search registrations" />
        <button class="btn" @click="adding = !adding">{{ adding ? 'Close form' : 'Add player' }}</button>
      </div>
      <div class="pills">
        <button v-for="s in FILTERS" :key="s" class="pill" :class="{ on: filter === s }" @click="filter = s">
          {{ s === 'all' ? 'All' : STATUS_LABEL[s] }} ({{ counts[s] || 0 }})
        </button>
      </div>
      <div v-if="filter === 'pending' && (counts.pending || 0) > 1" style="margin-top: 12px">
        <button class="btn sm primary" @click="approveAll">Approve all {{ counts.pending }} pending</button>
      </div>
    </div>

    <div v-if="adding" class="panel">
      <h3>Add a player</h3>
      <RegisterForm admin-mode @done="adding = false" />
    </div>

    <div v-if="list.length === 0" class="empty">No players with this status.</div>

    <div v-for="p in list" :key="p.id" class="pa">
      <div class="pa-top">
        <div class="who">
          <PlayerAvatar :player="p" big />
          <div>
            <div class="pa-name">{{ p.name }}</div>
            <div class="muted small" style="margin-top: 4px">{{ p.regNo }}, {{ p.mobile }}, {{ p.age }} yrs</div>
            <div class="small">
              {{ p.role }}, {{ p.battingStyle }} bat, {{ p.bowlingStyle
              }}{{ p.previousTeam ? '. Previous team: ' + p.previousTeam : '' }}
            </div>
            <div v-if="p.status === 'sold'" class="small" style="margin-top: 4px">
              Sold to <TeamChip :team="teams.find((t) => t.id === p.soldTo)" /> for {{ fmt(p.soldPrice) }}
              {{ settings.unit }}
            </div>
          </div>
        </div>
        <StatusBadge :status="p.status" />
      </div>
      <div class="pa-actions">
        <label class="inline-field" :for="'bp-' + p.id">
          Base price
          <input :id="'bp-' + p.id" :key="p.basePrice" inputmode="numeric" :value="p.basePrice" @blur="saveBasePrice(p, $event)" />
        </label>
        <template v-if="p.status === 'pending'">
          <button class="btn sm primary" @click="up(p, { status: 'approved' })">Approve</button>
          <button class="btn sm" @click="up(p, { status: 'rejected' })">Reject</button>
        </template>
        <button v-if="p.status === 'rejected'" class="btn sm" @click="up(p, { status: 'approved' })">Approve</button>
        <ConfirmButton
          v-if="p.status === 'sold' || p.status === 'unsold'"
          label="Release to pool"
          btn-class="btn sm"
          @confirm="release(p)"
        />
        <ConfirmButton label="Delete" @confirm="store.remove('players', p.id)" />
      </div>
    </div>
  </div>
</template>
