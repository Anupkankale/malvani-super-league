<script setup lang="ts">
useHead({ title: 'Auction · Malvani Super League' })
const { stats, players, teams, settings } = useLeague()
const tab = ref<'live' | 'teams' | 'players'>('live')
const TABS = [
  ['live', 'Live board'],
  ['teams', 'Squads'],
  ['players', 'All players'],
] as const

const recent = computed(() =>
  players.value
    .filter((p) => p.status === 'sold')
    .sort((a, b) => (b.soldAt || 0) - (a.soldAt || 0))
    .slice(0, 8),
)
const squadOf = (teamId: string) => players.value.filter((p) => p.status === 'sold' && p.soldTo === teamId)
</script>

<template>
  <div class="wrap page">
    <div class="page-head">
      <h1 class="page-title">Auction</h1>
      <p class="page-sub">Live bids, team purses and every squad, updated as the auctioneer works.</p>
    </div>
    <div class="subtabs" role="tablist">
      <button
        v-for="[k, l] in TABS"
        :key="k"
        role="tab"
        :aria-selected="tab === k"
        class="subtab"
        :class="{ on: tab === k }"
        @click="tab = k"
      >
        {{ l }}
      </button>
    </div>

    <div v-if="tab === 'live'" class="stack">
      <AuctionArena />
      <div class="grid-2">
        <div class="panel">
          <h3>Team purses</h3>
          <PurseTable />
        </div>
        <div class="panel">
          <h3>Recently sold</h3>
          <ul v-if="recent.length" class="rows">
            <li v-for="p in recent" :key="p.id" class="row">
              <div class="who">
                <PlayerAvatar :player="p" />
                <div>
                  <strong>{{ p.name }}</strong>
                  <div class="muted small">{{ p.role }}</div>
                </div>
              </div>
              <div class="row-r">
                <TeamChip :team="teams.find((t) => t.id === p.soldTo)" />
                <strong>{{ fmt(p.soldPrice) }}</strong>
              </div>
            </li>
          </ul>
          <div v-else class="empty">Sold players will be listed here.</div>
        </div>
      </div>
    </div>

    <div v-if="tab === 'teams'" class="teams">
      <TeamCard v-for="{ team, count, left } in stats" :key="team.id" :team="team">
        <div class="team-stats">
          <div><b>{{ count }}/{{ settings.maxSquad }}</b><span>players</span></div>
          <div><b>{{ fmt(left) }}</b><span>{{ settings.unit }} left</span></div>
        </div>
        <ul v-if="squadOf(team.id).length" class="squad">
          <li v-for="p in squadOf(team.id)" :key="p.id">
            <span>{{ p.name }} <span class="faint">{{ p.role }}</span></span>
            <span class="num">{{ fmt(p.soldPrice) }}</span>
          </li>
        </ul>
        <p v-else class="faint small" style="margin-top: 12px">No players bought yet.</p>
      </TeamCard>
    </div>

    <PlayersList v-if="tab === 'players'" />
  </div>
</template>
