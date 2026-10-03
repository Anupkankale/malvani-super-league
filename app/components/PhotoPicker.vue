<script setup lang="ts">
defineProps<{ id: string; value: string; error?: string; busy?: boolean }>()
const emit = defineEmits<{ pick: [file: File]; clear: [] }>()

function onChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (file) emit('pick', file)
}
</script>

<template>
  <div class="photo-pick">
    <div class="photo-box" :class="{ filled: value }">
      <img v-if="value" :src="value" alt="Your photo" />
      <svg v-else viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="18" r="8" fill="none" stroke="currentColor" stroke-width="2.5" />
        <path d="M8 42c2.5-9 8.8-13 16-13s13.5 4 16 13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
      </svg>
    </div>
    <div class="photo-side">
      <label class="btn" :for="id">{{ busy ? 'Working…' : value ? 'Change photo' : 'Add photo' }}</label>
      <input :id="id" class="photo-input" type="file" accept="image/*" @change="onChange" />
      <button v-if="value" type="button" class="btn ghost sm" @click="emit('clear')">Remove</button>
      <p class="field-hint">
        A clear head-and-shoulders photo. Teams see it on the auction board. Big photos are shrunk
        automatically{{ value ? ', yours is now about ' + photoKB(value) + ' KB' : '' }}.
      </p>
      <em v-if="error" class="err">{{ error }}</em>
    </div>
  </div>
</template>
