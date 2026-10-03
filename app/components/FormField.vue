<script setup lang="ts">
defineProps<{ id: string; label: string; hint?: string; error?: string }>()
</script>

<template>
  <div class="field">
    <label class="field-label" :for="id">{{ label }}</label>
    <slot />
    <span v-if="hint && !error" class="field-hint">{{ hint }}</span>
    <em v-if="error" class="err">{{ error }}</em>
  </div>
</template>
