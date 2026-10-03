<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const props = defineProps<{ value: number }>()
const el = ref<HTMLElement | null>(null)
let played = false
let st: ScrollTrigger | null = null

// Counts up from 0 the first time the number scrolls into view.
function setup() {
  st?.kill()
  st = null
  const node = el.value
  if (!node) return
  node.textContent = fmt(props.value)
  if (REDUCED || played || !props.value) return
  const o = { v: 0 }
  st = ScrollTrigger.create({
    trigger: node,
    start: 'top 95%',
    once: true,
    onEnter: () => {
      played = true
      gsap.to(o, {
        v: props.value,
        duration: 1.4,
        ease: 'power2.out',
        onUpdate: () => {
          node.textContent = fmt(Math.round(o.v))
        },
      })
    },
  })
}

onMounted(setup)
watch(() => props.value, setup, { flush: 'post' })
onBeforeUnmount(() => st?.kill())
</script>

<template>
  <span ref="el" class="num" />
</template>
