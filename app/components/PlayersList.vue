<script setup lang="ts">
const { players, teams } = useLeague()
const q = ref('')
const filter = ref('all')
const FILTERS = ['all', 'approved', 'sold', 'unsold']

const pub = computed(() => players.value.filter((p) => ['approved', 'sold', 'unsold'].includes(p.status)))
const list = computed(() =>
  pub.value
    .filter((p) => filter.value === 'all' || p.status === filter.value)
    .filter((p) => (p.name + ' ' + p.role).toLowerCase().includes(q.value.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name)),
)
const countFor = (s: string) => (s === 'all' ? pub.value.length : pub.value.filter((p) => p.status === s).length)
</script>

<template>
  <div class="panel">
    <div class="toolbar">
      <input id="pl-search" v-model="q" class="search" placeholder="Search name or role" aria-label="Search players" />
      <div class="pills">
        <button v-for="s in FILTERS" :key="s" class="pill" :class="{ on: filter === s }" @click="filter = s">
          {{ s === 'all' ? 'All' : STATUS_LABEL[s] }} ({{ countFor(s) }})
        </button>
      </div>
    </div>
    <ul v-if="list.length" class="rows">
      <li v-for="p in list" :key="p.id" class="row">
        <div class="who">
          <PlayerAvatar :player="p" />
          <div>
            <strong>{{ p.name }}</strong>
            <div class="muted small">{{ p.role }}, {{ p.battingStyle }} bat</div>
          </div>
        </div>
        <div class="row-r">
          <template v-if="p.status === 'sold'">
            <TeamChip :team="teams.find((t) => t.id === p.soldTo)" />
            <strong>{{ fmt(p.soldPrice) }}</strong>
          </template>
          <StatusBadge v-else :status="p.status" />
        </div>
      </li>
    </ul>
    <div v-else class="empty">No players match yet. Approved players show up here before the auction.</div>
  </div>
</template>
