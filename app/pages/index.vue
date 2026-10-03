<script setup lang="ts">
import { gsap } from 'gsap'

const { players, teams, stats, settings, auction, isLive } = useLeague()
const root = ref<HTMLElement | null>(null)

const registered = computed(() => players.value.filter((p) => p.status !== 'rejected').length)
const soldCount = computed(() => players.value.filter((p) => p.status === 'sold').length)
const readyCount = computed(() => players.value.filter((p) => p.status === 'approved').length)
const livePlayer = computed(() => (isLive.value ? players.value.find((p) => p.id === auction.value.playerId) : null))
const leader = computed(() => (isLive.value ? teams.value.find((t) => t.id === auction.value.leader) : null))

const steps = computed(() => {
  const s = settings.value
  return [
    ['Register', 'Fill the player form with your role, batting and bowling style. You get a registration number straight away.'],
    ['Get approved', `The organisers check each entry. Approved players join the auction pool with a base price of ${fmt(s.basePrice)} ${s.unit}.`],
    ['Auction night', `Players go under the hammer one by one. Teams raise by ${fmt(s.increment)} ${s.unit} until the highest bid wins.`],
    ['Play the season', `Each team builds a squad of up to ${s.maxSquad} and takes the field for the league.`],
  ]
})

let ctx: gsap.Context | null = null
onMounted(() => {
  if (REDUCED) return
  ctx = gsap.context(() => {
    gsap
      .timeline({ defaults: { ease: 'power4.out' } })
      .from('.hero-title .ln>span', { yPercent: 105, duration: 0.9, stagger: 0.1 })
      .from('.hero-mr, .hero-lede, .hero-ctas, .status-pill', { y: 18, duration: 0.6, stagger: 0.07 }, '-=0.55')
      .from('.scene-wrap', { x: 40, duration: 0.9 }, 0.1)
    gsap.utils.toArray<HTMLElement>('.reveal').forEach((el) => {
      gsap.from(el.children, {
        y: 36,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      })
    })
    gsap.utils.toArray<HTMLElement>('.step-ball').forEach((b, i) => {
      gsap.from(b, {
        x: -60,
        rotation: -360,
        duration: 0.9,
        delay: i * 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.over', start: 'top 85%', once: true },
      })
    })
  }, root.value!)
})
onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <div ref="root">
    <section class="hero">
      <div class="hero-bg" :style="{ backgroundImage: `url(${HERO_BG})` }" aria-hidden="true" />
      <div class="wrap hero-in">
        <div>
          <img class="hero-logo" :src="LOGO" alt="" aria-hidden="true" />
          <span class="status-pill" :class="{ live: isLive }">
            <i />
            {{ isLive ? 'Auction is live now' : settings.registrationOpen ? 'Player registration is open' : 'Registration closed' }}
          </span>
          <h1 class="hero-title" aria-label="Malvani Super League">
            <span class="ln"><span>Malvani</span></span>
            <span class="ln"><span>Super League</span></span>
          </h1>
          <p class="hero-mr mr">{{ NAME_MR }}, सीझन {{ settings.season }}</p>
          <p class="hero-lede">
            {{ teams.length }} teams from the Malvan coast bid for the best local cricketers. Register as a player, and
            follow every bid live on auction night.
          </p>
          <div class="hero-ctas">
            <NuxtLink v-if="settings.registrationOpen" class="btn primary lg" to="/register">Register as a player</NuxtLink>
            <NuxtLink class="btn lg" to="/auction">{{ isLive ? 'Watch the live auction' : 'See the auction' }}</NuxtLink>
          </div>
          <p class="motto">{{ MOTTO }}</p>
        </div>
        <CricketScene />
      </div>
    </section>

    <section class="board" aria-label="League numbers">
      <div class="wrap board-in">
        <div class="board-cell">
          <div class="board-val"><CountUp :value="registered" /></div>
          <div class="board-lbl">Players registered</div>
        </div>
        <div class="board-cell">
          <div class="board-val"><CountUp :value="teams.length" /></div>
          <div class="board-lbl">Franchise teams</div>
        </div>
        <div class="board-cell">
          <div class="board-val"><CountUp :value="soldCount" /></div>
          <div class="board-lbl">Players sold</div>
        </div>
        <div class="board-cell">
          <div class="board-val"><CountUp :value="settings.purse" /><small>{{ settings.unit }}</small></div>
          <div class="board-lbl">Purse per team</div>
        </div>
      </div>
    </section>

    <section class="sec">
      <div class="wrap">
        <div class="sec-head reveal">
          <div>
            <h2 class="sec-title">From form to franchise</h2>
            <p class="sec-sub">Four steps from filling in the form to walking out in your team's colours.</p>
          </div>
        </div>
        <div class="over">
          <div v-for="([t, d], i) in steps" :key="t" class="step">
            <div class="step-ball">{{ i + 1 }}</div>
            <h3>{{ t }}</h3>
            <p>{{ d }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="sec alt">
      <div class="wrap">
        <div class="sec-head reveal">
          <div>
            <h2 class="sec-title">The {{ teams.length }} franchises</h2>
            <p class="sec-sub">
              Every team starts auction night with the same purse. Squads fill up here as players are sold.
            </p>
          </div>
          <NuxtLink class="btn" to="/auction">Full squads and purses</NuxtLink>
        </div>
        <div class="teams reveal">
          <TeamCard v-for="{ team, count, left } in stats" :key="team.id" :team="team">
            <div class="team-stats">
              <div><b>{{ count }}</b><span>players</span></div>
              <div><b>{{ fmt(left) }}</b><span>{{ settings.unit }} left</span></div>
            </div>
          </TeamCard>
        </div>
      </div>
    </section>

    <section class="sec">
      <div class="wrap teaser reveal">
        <div>
          <h2 class="sec-title">{{ isLive ? 'Under the hammer now' : 'Auction night' }}</h2>
          <p class="sec-sub">
            <template v-if="isLive">Bids update here the moment the auctioneer takes them.</template>
            <template v-else-if="settings.auctionDate">
              The auction is on {{ settings.auctionDate }} at {{ settings.venue }}. Follow every bid live on the Auction
              page.
            </template>
            <template v-else>
              Follow every bid live on the Auction page. The date will be announced by the organisers.
            </template>
          </p>
          <div class="hero-ctas">
            <NuxtLink class="btn gold lg" to="/auction">Open the auction</NuxtLink>
          </div>
        </div>
        <div class="arena">
          <template v-if="livePlayer">
            <span class="lot"><i />Live</span>
            <h3 class="p-name" style="font-size: clamp(30px, 3.6vw, 42px); margin-top: 14px">{{ livePlayer.name }}</h3>
            <p class="muted">{{ livePlayer.role }}, {{ livePlayer.battingStyle }} bat</p>
            <div class="bid-amt" style="font-size: clamp(48px, 6vw, 72px); margin-top: 10px">
              {{ fmt(auction.currentBid == null ? livePlayer.basePrice : auction.currentBid) }}
              <small>{{ settings.unit }}</small>
            </div>
            <div class="bid-lead">
              <template v-if="leader">Leading: <TeamChip :team="leader" big /></template>
              <template v-else>Opening at base price</template>
            </div>
          </template>
          <template v-else>
            <span class="tag">Auction pool</span>
            <div class="bid-amt" style="font-size: clamp(48px, 6vw, 72px); margin-top: 14px">
              {{ readyCount }}<small>players ready</small>
            </div>
            <p class="muted" style="margin-top: 8px">
              {{ soldCount }} sold so far. Squads and remaining purses are on the Auction page.
            </p>
          </template>
        </div>
      </div>
    </section>

    <section v-if="settings.registrationOpen" class="wrap">
      <div class="cta-band reveal">
        <span class="seam" aria-hidden="true" />
        <span class="seam two" aria-hidden="true" />
        <div>
          <h2>Your name in the auction pool</h2>
          <p>It takes two minutes. Keep your mobile number handy; the organisers use it to contact you.</p>
        </div>
        <NuxtLink class="btn gold lg" to="/register">Register now</NuxtLink>
      </div>
    </section>
  </div>
</template>
