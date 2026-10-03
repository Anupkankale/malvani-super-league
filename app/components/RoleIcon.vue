<script setup lang="ts">
defineProps<{ role: string }>()
</script>

<template>
  <svg
    viewBox="0 0 34 34"
    aria-hidden="true"
    stroke="currentColor"
    stroke-width="2"
    fill="none"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path v-if="role === 'Batsman'" d="M24 4l6 6-14 14-6-6zM10 18l-6 6 6 6 6-6" />
    <template v-else-if="role === 'Bowler'">
      <circle cx="17" cy="17" r="11" />
      <path d="M11 8c3 5 3 13 0 18M23 8c-3 5-3 13 0 18" stroke-dasharray="2 2.5" />
    </template>
    <template v-else-if="role === 'All-rounder'">
      <path d="M20 3l5 5-11 11-5-5z" />
      <circle cx="22" cy="24" r="6" />
    </template>
    <template v-else>
      <path d="M8 14c0-5 4-9 9-9s9 4 9 9v6c0 5-4 9-9 9s-9-4-9-9z" />
      <path d="M8 17h18M13 11v12M21 11v12" />
    </template>
  </svg>
</template>
