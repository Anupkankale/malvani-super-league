<script setup lang="ts">
import type { Team } from '#shared/utils/league'

withDefaults(defineProps<{ team: Team; ownerFallback?: string }>(), { ownerFallback: 'To be announced' })
</script>

<template>
  <article class="team-card" :style="{ '--team': team.color }">
    <slot name="replace">
      <div class="team-top">
        <TeamShield :team="team" />
        <div>
          <h3>{{ team.name }}</h3>
          <p class="team-owner">Owner: {{ team.owner || ownerFallback }}</p>
        </div>
      </div>
      <slot />
    </slot>
  </article>
</template>
