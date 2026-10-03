<script setup lang="ts">
import type { Team } from '#shared/utils/league'

defineProps<{ team?: Team | null; big?: boolean }>()
</script>

<template>
  <span v-if="team" class="chip" :class="{ big }"><i :style="{ background: team.color }" />{{ team.name }}</span>
</template>
