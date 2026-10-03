<script setup lang="ts">
const props = withDefaults(
  defineProps<{ label: string; confirmLabel?: string; btnClass?: string }>(),
  { confirmLabel: 'Tap again to confirm', btnClass: 'btn sm ghost danger' },
)
const emit = defineEmits<{ confirm: [] }>()

// First tap arms the button; a second tap within 3s confirms.
const armed = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

function click() {
  clearTimeout(timer)
  if (armed.value) {
    armed.value = false
    emit('confirm')
  } else {
    armed.value = true
    timer = setTimeout(() => (armed.value = false), 3000)
  }
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <button type="button" :class="[props.btnClass, { armed }]" @click="click">
    {{ armed ? confirmLabel : label }}
  </button>
</template>
