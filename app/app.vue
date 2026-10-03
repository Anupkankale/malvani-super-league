<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const route = useRoute()
const { players, teams } = useLeague()
const main = ref<HTMLElement | null>(null)

// Slide each non-home page in on navigation (the home page runs its own intro).
watch(
  () => route.path,
  (path) => {
    if (REDUCED || !main.value || path === '/') return
    gsap.from(main.value, { y: 18, duration: 0.45, ease: 'power3.out', clearProps: 'transform' })
  },
  { flush: 'post' },
)

watch([() => route.path, () => players.value.length, () => teams.value.length], () => ScrollTrigger.refresh(), {
  flush: 'post',
})
</script>

<template>
  <SiteNav />
  <main ref="main">
    <NuxtPage />
  </main>
  <SiteFooter />
</template>
