<script setup lang="ts">
const props = defineProps<{ player: { name?: string; photo?: string }; big?: boolean }>()

const initials = computed(() =>
  (props.player.name || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase(),
)
</script>

<template>
  <img v-if="player.photo" class="avatar" :class="{ big }" :src="player.photo" alt="" />
  <span v-else class="avatar blank" :class="{ big }" aria-hidden="true">{{ initials }}</span>
</template>
