<script setup lang="ts">
defineProps<{ team: { color: string; short: string } }>()
</script>

<template>
  <svg class="shield" viewBox="0 0 58 66" aria-hidden="true">
    <path d="M29 1 55 9.5v23c0 16.5-11.5 27-26 33.5C14.5 59.5 3 49 3 32.5v-23Z" fill="#E8AD44" />
    <path d="M29 4 52 11.5v21c0 15-10.5 24.5-23 30.5C16.5 57 6 47.5 6 32.5v-21Z" :fill="team.color" />
    <path d="M29 4 52 11.5v21c0 15-10.5 24.5-23 30.5Z" fill="rgba(0,0,0,.18)" />
    <path d="M29 9 47 15v17c0 11.5-7.5 19-18 24" stroke="rgba(255,255,255,.35)" stroke-width="1.2" fill="none" />
    <text
      x="29"
      y="39"
      text-anchor="middle"
      font-family="Anton, Impact, sans-serif"
      font-weight="400"
      font-size="17"
      letter-spacing=".5"
      fill="#fff"
    >
      {{ team.short }}
    </text>
  </svg>
</template>
