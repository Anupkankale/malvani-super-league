<script setup lang="ts">
const { stats, settings } = useLeague()
</script>

<template>
  <div class="table-wrap">
    <table class="tbl">
      <thead>
        <tr>
          <th>Team</th>
          <th class="r">Squad</th>
          <th class="r">Spent</th>
          <th class="r">Left</th>
          <th>Purse used</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="s in stats" :key="s.team.id">
          <td><TeamChip :team="s.team" /></td>
          <td class="r">{{ s.count }}/{{ settings.maxSquad }}</td>
          <td class="r">{{ fmt(s.spent) }}</td>
          <td class="r"><b>{{ fmt(s.left) }}</b></td>
          <td>
            <div class="bar">
              <i
                :style="{
                  width: Math.min(100, (s.spent / (Number(s.team.purse ?? settings.purse) || 1)) * 100) + '%',
                  background: s.team.color,
                }"
              />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
