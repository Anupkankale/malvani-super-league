<script setup lang="ts">
import { gsap } from 'gsap'

const { isAdmin, isLive } = useLeague()
const route = useRoute()
const open = ref(false)
const links = ref<HTMLElement | null>(null)

const items = computed(() => [
  { to: '/', label: 'Home' },
  { to: '/register', label: 'Registration', cta: true },
  { to: '/auction', label: 'Auction' },
  { to: '/about', label: 'About' },
  isAdmin.value ? { to: '/admin', label: 'Admin panel' } : { to: '/login', label: 'Login' },
])

watch(() => route.path, () => (open.value = false))

watch(open, async (v) => {
  if (!v || REDUCED) return
  await nextTick()
  if (links.value) gsap.from(links.value.children, { x: -24, duration: 0.35, stagger: 0.05, ease: 'power2.out' })
})
</script>

<template>
  <header class="nav">
    <div class="wrap nav-in">
      <NuxtLink class="brand" to="/" aria-label="Malvani Super League home">
        <img class="brand-mark" :src="LOGO" alt="Malvani Super League" />
        <span class="brand-txt">
          Malvani Super League
          <small class="mr">{{ NAME_MR }}</small>
        </span>
      </NuxtLink>
      <button class="burger" :class="{ open }" aria-label="Menu" :aria-expanded="open" @click="open = !open">
        <span />
      </button>
      <nav ref="links" class="nav-links" :data-open="String(open)" aria-label="Main">
        <NuxtLink
          v-for="item in items"
          :key="item.to"
          :to="item.to"
          class="nav-link"
          :class="{ on: route.path === item.to, 'nav-cta': item.cta }"
          :aria-current="route.path === item.to ? 'page' : undefined"
        >
          <span v-if="item.to === '/auction' && isLive" class="live-dot" aria-hidden="true" />
          {{ item.label }}{{ item.to === '/auction' && isLive ? ' (live)' : '' }}
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>
