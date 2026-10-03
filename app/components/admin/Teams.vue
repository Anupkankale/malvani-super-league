<script setup lang="ts">
import type { Team } from '#shared/utils/league'

const { store, teams, stats, players, settings } = useLeague()
const editing = ref<string | null>(null)

const loadDemo = () =>
  DEMO_TEAMS.forEach(({ id, ...t }) => store.set('teams', id, { ...t, purse: Number(settings.value.purse) }))

// Deleting a team sends its bought players back to the pool first.
async function removeTeam(team: Team) {
  for (const p of players.value.filter((x) => x.soldTo === team.id))
    await store.update('players', p.id, { status: 'approved', soldTo: null, soldPrice: null, soldAt: null })
  store.remove('teams', team.id)
}

function addTeam(d: Omit<Team, 'id'>) {
  store.set('teams', 't' + newId(), d)
  editing.value = null
}

function updateTeam(team: Team, d: Omit<Team, 'id'>) {
  store.update('teams', team.id, d)
  editing.value = null
}
</script>

<template>
  <div class="stack">
    <div class="panel">
      <div class="toolbar" :style="{ marginBottom: editing === 'new' || !teams.length ? '14px' : '0' }">
        <h3>{{ teams.length }} teams</h3>
        <button class="btn" @click="editing = 'new'">Add team</button>
      </div>
      <button v-if="teams.length === 0" class="btn primary" @click="loadDemo">Load the 6 demo teams</button>
      <AdminTeamEditor v-if="editing === 'new'" @cancel="editing = null" @save="addTeam" />
    </div>
    <div class="teams">
      <TeamCard v-for="{ team, count, spent, left } in stats" :key="team.id" :team="team" owner-fallback="—">
        <template v-if="editing === team.id" #replace>
          <AdminTeamEditor :team="team" @cancel="editing = null" @save="updateTeam(team, $event)" />
        </template>
        <div class="team-stats">
          <div><b>{{ count }}</b><span>players</span></div>
          <div><b>{{ fmt(spent) }}</b><span>spent</span></div>
          <div><b>{{ fmt(left) }}</b><span>left of {{ fmt(team.purse) }}</span></div>
        </div>
        <div class="actions">
          <button class="btn sm" @click="editing = team.id">Edit</button>
          <ConfirmButton
            label="Delete team"
            :confirm-label="count ? `Releases ${count} players. Tap again` : 'Tap again to confirm'"
            @confirm="removeTeam(team)"
          />
        </div>
      </TeamCard>
    </div>
  </div>
</template>
