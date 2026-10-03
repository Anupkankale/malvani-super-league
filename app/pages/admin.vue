<script setup lang="ts">
useHead({ title: 'Admin panel · Malvani Super League' })
definePageMeta({ middleware: 'admin' })

const { players, logout: signOut } = useLeague()
const sub = ref<'auction' | 'players' | 'teams' | 'settings'>('auction')
const pending = computed(() => players.value.filter((p) => p.status === 'pending').length)
const tabs = computed(() => [
  ['auction', 'Run auction'],
  ['players', 'Players' + (pending.value ? ` (${pending.value} new)` : '')],
  ['teams', 'Teams'],
  ['settings', 'Settings'],
] as const)

async function logout() {
  await signOut()
  await navigateTo('/')
}
</script>

<template>
  <div class="wrap page">
    <div class="admin-bar">
      <h1 class="page-title" style="font-size: clamp(32px, 4.4vw, 48px)">Admin panel</h1>
      <button class="btn ghost" @click="logout">Log out</button>
    </div>
    <div class="subtabs" role="tablist">
      <button
        v-for="[k, l] in tabs"
        :key="k"
        role="tab"
        :aria-selected="sub === k"
        class="subtab"
        :class="{ on: sub === k }"
        @click="sub = k"
      >
        {{ l }}
      </button>
    </div>
    <AdminAuctionControl v-if="sub === 'auction'" />
    <AdminPlayers v-if="sub === 'players'" />
    <AdminTeams v-if="sub === 'teams'" />
    <AdminSettings v-if="sub === 'settings'" />
  </div>
</template>
