<script setup lang="ts">
import { gsap } from 'gsap'

useHead({ title: 'About · Malvani Super League' })
const { settings, teams } = useLeague()
const root = ref<HTMLElement | null>(null)

const faq = computed(() => {
  const s = settings.value
  const contact = [s.contactName, s.contactPhone].filter(Boolean).join(', ')
  return [
    ['Who can register?', 'Any cricketer from the Malvan area aged 12 to 70. One registration per mobile number.'],
    [
      "When do I know if I'm approved?",
      'The organisers review entries before auction night. Approved players appear in the All players list on the Auction page.',
    ],
    ['Can I pick my team?', 'No. Teams bid for players at the auction; the highest bid wins.'],
    ['Who do I contact?', contact ? contact + '.' : 'Organiser contact details will be posted here.'],
  ]
})

let ctx: gsap.Context | null = null
onMounted(() => {
  if (REDUCED) return
  ctx = gsap.context(() => {
    gsap.from('.fact', {
      y: 30,
      duration: 0.6,
      stagger: 0.08,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.facts', start: 'top 88%', once: true },
    })
    gsap.from('.about-ball', { rotation: -540, x: -120, duration: 1.4, ease: 'power3.out' })
  }, root.value!)
})
onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <div ref="root" class="wrap page">
    <div class="about-hero">
      <div>
        <h1 class="page-title">About the league</h1>
        <p class="hero-mr mr">आपली माती, आपलो खेळ</p>
        <div class="prose" style="margin-top: 18px">
          <p>
            <strong>Malvani Super League</strong> is a local cricket tournament for players from Malvan and the villages
            around it. Instead of fixed village sides, {{ teams.length }} franchise teams build their squads at a live
            player auction, so every season mixes new partnerships.
          </p>
          <p>
            Any local cricketer can register. After the organisers approve an entry, the player goes into the auction
            pool, and team owners bid for them with a fixed purse.
          </p>
        </div>
      </div>
      <svg class="about-ball" viewBox="0 0 200 200" aria-hidden="true" style="width: 100%; max-width: 280px; justify-self: center">
        <defs>
          <radialGradient id="ab" cx="35%" cy="30%" r="70%">
            <stop offset="0" stop-color="#F0575C" />
            <stop offset=".55" stop-color="#C1272D" />
            <stop offset="1" stop-color="#6E1115" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="92" fill="url(#ab)" />
        <path d="M52 22c26 40 26 116 0 156M148 22c-26 40-26 116 0 156" stroke="#FFF3D1" stroke-width="3" stroke-dasharray="6 6" fill="none" />
        <path d="M60 22c26 40 26 116 0 156M140 22c-26 40-26 116 0 156" stroke="#FFF3D1" stroke-width="1.5" fill="none" opacity=".5" />
      </svg>
    </div>

    <section class="sec" style="padding-bottom: 40px">
      <div class="facts">
        <div class="fact"><h4>Season</h4><p>{{ settings.season }}</p></div>
        <div class="fact"><h4>Venue</h4><p>{{ settings.venue || 'To be announced' }}</p></div>
        <div class="fact"><h4>Auction night</h4><p>{{ settings.auctionDate || 'Date to be announced' }}</p></div>
        <div class="fact"><h4>Teams</h4><p>{{ teams.map((t) => t.name).join(', ') || 'To be announced' }}</p></div>
      </div>
    </section>

    <section class="grid-2" style="align-items: start">
      <div class="panel">
        <h3>How the auction works</h3>
        <ul class="rules">
          <li><span>Every team's purse</span><b>{{ fmt(settings.purse) }} {{ settings.unit }}</b></li>
          <li><span>Default base price</span><b>{{ fmt(settings.basePrice) }} {{ settings.unit }}</b></li>
          <li><span>Each raise</span><b>+{{ fmt(settings.increment) }} {{ settings.unit }}</b></li>
          <li><span>Squad limit</span><b>{{ settings.maxSquad }} players</b></li>
        </ul>
        <p class="muted small" style="margin-top: 12px">
          A team can't bid more than its remaining purse, or bid once its squad is full. Players with no bids are marked
          unsold and may come back in a later round.
        </p>
      </div>
      <div class="faq">
        <details v-for="[q, a] in faq" :key="q">
          <summary>{{ q }}</summary>
          <p>{{ a }}</p>
        </details>
      </div>
    </section>

    <div v-if="settings.registrationOpen" style="margin-top: 40px">
      <NuxtLink class="btn primary lg" to="/register">Register as a player</NuxtLink>
    </div>
  </div>
</template>
