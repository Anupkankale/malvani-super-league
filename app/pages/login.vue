<script setup lang="ts">
import { gsap } from 'gsap'

useHead({ title: 'Admin login · Malvani Super League' })
definePageMeta({ middleware: 'admin' })

const { login } = useLeague()
const u = ref('')
const p = ref('')
const err = ref('')
const art = ref<HTMLElement | null>(null)

// Wrong password: the ball knocks the bails off.
function knock() {
  if (REDUCED || !art.value) return
  const q = gsap.utils.selector(art.value)
  gsap
    .timeline()
    .fromTo(q('.lball'), { x: 260, y: -40 }, { x: 0, y: 0, duration: 0.35, ease: 'power1.in' })
    .to(q('.bail-l'), { x: -40, y: -70, rotation: -260, duration: 0.6, ease: 'power2.out' }, 0.35)
    .to(q('.bail-r'), { x: 44, y: -60, rotation: 240, duration: 0.6, ease: 'power2.out' }, 0.35)
    .to(q('.stump-m'), { rotation: 8, svgOrigin: '100 250', duration: 0.12, yoyo: true, repeat: 1 }, 0.35)
    .to(q('.bail-l, .bail-r'), { x: 0, y: 0, rotation: 0, duration: 0.5, ease: 'power2.inOut' }, 1.4)
    .to(q('.lball'), { x: -40, y: 60, opacity: 0, duration: 0.4 }, 0.4)
    .set(q('.lball'), { opacity: 1, x: 260, y: -40 })
}

const busy = ref(false)

async function submit() {
  busy.value = true
  err.value = ''
  try {
    await login(u.value, p.value)
    await navigateTo('/admin')
  } catch (e: any) {
    err.value =
      e?.statusCode === 401 ? 'Wrong username or password. Try again.' : e?.data?.message || "Couldn't reach the server. Try again."
    if (e?.statusCode === 401) knock()
  }
  busy.value = false
}
</script>

<template>
  <div class="wrap page">
    <div class="login">
      <div ref="art" class="login-art">
        <svg viewBox="0 0 200 270" aria-hidden="true">
          <ellipse cx="100" cy="255" rx="90" ry="10" fill="#061810" />
          <rect x="52" y="88" width="12" height="162" rx="4" fill="#FFF3D1" />
          <rect class="stump-m" x="94" y="88" width="12" height="162" rx="4" fill="#FFF3D1" />
          <rect x="136" y="88" width="12" height="162" rx="4" fill="#FFF3D1" />
          <rect class="bail-l" x="54" y="78" width="46" height="9" rx="4" fill="#F4B942" />
          <rect class="bail-r" x="100" y="78" width="46" height="9" rx="4" fill="#F4B942" />
          <g class="lball" transform="translate(260,-40)">
            <circle cx="100" cy="150" r="13" fill="#C1272D" />
            <path d="M93 139c4 6 4 16 0 22M107 139c-4 6-4 16 0 22" stroke="#FFF3D1" stroke-width="1.3" stroke-dasharray="2 2" fill="none" />
          </g>
        </svg>
      </div>
      <form class="panel login-card form" @submit.prevent="submit">
        <div>
          <h1 class="page-title" style="font-size: clamp(32px, 4vw, 44px)">Admin login</h1>
          <p class="muted" style="margin-top: 8px">For organisers running registrations and the auction.</p>
        </div>
        <FormField id="lg-user" label="Username">
          <input id="lg-user" v-model="u" autocomplete="username" />
        </FormField>
        <FormField id="lg-pass" label="Password">
          <input id="lg-pass" v-model="p" type="password" autocomplete="current-password" />
        </FormField>
        <p v-if="err" class="err" role="alert">{{ err }}</p>
        <button class="btn primary lg" :disabled="busy">{{ busy ? 'Checking…' : 'Log in' }}</button>
      </form>
    </div>
  </div>
</template>
