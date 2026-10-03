<script setup lang="ts">
defineProps<{ status: string }>()
</script>

<template>
  <span class="badge" :class="'b-' + status">{{ STATUS_LABEL[status] || status }}</span>
</template>
