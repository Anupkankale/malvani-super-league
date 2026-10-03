<script setup lang="ts">
import { gsap } from 'gsap'

interface Shot {
  id: string
  runs: number
  label: string
  color: string
  side: 'L' | 'R'
  size: number
  at: [number, number]
  soft?: boolean
  flight: (tl: gsap.core.Timeline, t: Element[]) => void
}

const SHOTS: Shot[] = [
  {
    id: 'six-long-off', runs: 6, label: 'SIX!', color: '#F4B942', side: 'R', size: 72, at: [450, 150],
    flight: (tl, t) =>
      tl
        .to(t, { x: 660, duration: 1, ease: 'power1.out', stagger: 0.045 }, 1.11)
        .to(t, { y: -70, scale: 1.9, rotation: 900, duration: 1, ease: 'power2.out', stagger: 0.045 }, 1.11),
  },
  {
    id: 'four-square-leg', runs: 4, label: 'FOUR!', color: '#E0467C', side: 'L', size: 66, at: [150, 160],
    flight: (tl, t) =>
      tl
        .to(t, { x: -50, duration: 1.05, ease: 'power2.out', stagger: 0.04 }, 1.11)
        .to(t, { keyframes: { y: [420, 452, 440, 462, 456, 470], ease: 'sine.inOut' }, scale: 1.25, rotation: -1080, duration: 1.05, stagger: 0.04 }, 1.11),
  },
  {
    id: 'two-cover', runs: 2, label: '2 RUNS', color: '#FFF3D1', side: 'R', size: 56, at: [455, 150], soft: true,
    flight: (tl, t) =>
      tl
        .to(t, { x: 452, duration: 1.3, ease: 'power3.out', stagger: 0.03 }, 1.11)
        .to(t, { keyframes: { y: [420, 404, 396, 392], ease: 'sine.out' }, scale: 0.72, rotation: 540, duration: 1.3, stagger: 0.03 }, 1.11),
  },
  {
    id: 'six-midwicket', runs: 6, label: 'SIX!', color: '#F4B942', side: 'L', size: 72, at: [165, 150],
    flight: (tl, t) =>
      tl
        .to(t, { x: -80, duration: 1, ease: 'power1.out', stagger: 0.045 }, 1.11)
        .to(t, { y: -60, scale: 1.9, rotation: -900, duration: 1, ease: 'power2.out', stagger: 0.045 }, 1.11),
  },
  {
    id: 'four-cover-drive', runs: 4, label: 'FOUR!', color: '#E0467C', side: 'R', size: 66, at: [450, 160],
    flight: (tl, t) =>
      tl
        .to(t, { x: 660, duration: 1.05, ease: 'power2.out', stagger: 0.04 }, 1.11)
        .to(t, { keyframes: { y: [420, 448, 436, 452, 446, 456], ease: 'sine.inOut' }, scale: 1.2, rotation: 1080, duration: 1.05, stagger: 0.04 }, 1.11),
  },
  {
    id: 'six-straight', runs: 6, label: 'SIX!', color: '#F4B942', side: 'R', size: 72, at: [420, 130],
    flight: (tl, t) =>
      tl
        .to(t, { x: 360, duration: 1.1, ease: 'power1.out', stagger: 0.045 }, 1.11)
        .to(t, { y: -80, scale: 0.35, rotation: 720, duration: 1.1, ease: 'power2.out', stagger: 0.045 }, 1.11),
  },
]

const LAMPS: [number, number][] = [
  [70, 40],
  [530, 40],
]
const BURST = Array.from({ length: 8 }, (_, i) => {
  const a = (i / 8) * Math.PI * 2
  return { x1: Math.cos(a) * 10, y1: Math.sin(a) * 10, x2: Math.cos(a) * 20, y2: Math.sin(a) * 20 }
})

const root = ref<HTMLElement | null>(null)
const score = reactive<{ runs: number; last: Shot | null }>({ runs: 0, last: null })
let next = () => {}
const nextBall = () => next()
let ctx: gsap.Context | null = null

onMounted(() => {
  const q = gsap.utils.selector(root.value)
  ctx = gsap.context(() => {})
  const ball = q('#ball')[0]!
  const ghosts = q('.ghost')
  const bat = q('#bat')[0]!
  const burst = q('#burst')[0]!
  const label = q('#shotLabel')[0]!
  const text = q('#shotText')[0]!
  const all = [ball, ...ghosts]
  let idx = 0
  let runs = 0
  let current: gsap.core.Timeline | null = null
  let pending: gsap.core.Tween | null = null

  ctx.add(() => {
    gsap.set(bat, { svgOrigin: '262 318', rotation: -12 })
    gsap.set(all, { x: 300, y: 236, scale: 0.42, transformOrigin: '50% 50%' })
    gsap.set(burst, { svgOrigin: '0 0', x: 262, y: 420, scale: 0, opacity: 0 })
    gsap.set(label, { scale: 0, transformOrigin: '50% 50%' })
  })

  const setLabel = (shot: Shot, txt: string) => {
    text.textContent = txt
    text.setAttribute('fill', shot.color)
    text.setAttribute('font-size', String(shot.size))
  }

  if (REDUCED) {
    const shot = SHOTS[0]!
    setLabel(shot, shot.label)
    gsap.set(ball, { x: 262, y: 420, scale: 1 })
    gsap.set(ghosts, { opacity: 0 })
    gsap.set(label, { x: shot.at[0], y: shot.at[1], rotation: -10, scale: 1 })
    gsap.set(bat, { rotation: 20 })
    score.runs = 6
    score.last = shot
    return
  }

  const addRuns = (shot: Shot, n: number) => {
    runs += n
    score.runs = runs
    score.last = shot
  }

  const play = (shot: Shot) =>
    ctx!.add(() => {
      const leftward = shot.side === 'L'
      const back = shot.soft ? (leftward ? -70 : 70) : leftward ? -118 : 118
      const through = shot.soft ? (leftward ? 40 : -40) : leftward ? 112 : -112
      setLabel(shot, shot.soft ? '1 RUN' : shot.label)
      const tl = gsap.timeline({
        onComplete: () => {
          ctx!.add(() => {
            pending = gsap.delayedCall(0.8, next)
          })
        },
      })
      current = tl
      tl.set(all, { x: 300, y: 236, scale: 0.42, rotation: 0, opacity: 1 }, 0)
        .set(ghosts, { opacity: 0 }, 0)
        .set(label, { x: shot.at[0], y: shot.at[1], scale: 0, opacity: 1, rotation: shot.at[0] < 300 ? 8 : -10 }, 0)
        .to(bat, { rotation: back, duration: 0.55, ease: 'power2.out' }, 0)
        .to(ball, { x: 306, duration: 0.55, ease: 'none' }, 0.3)
        .to(ball, { y: 382, scale: 0.8, duration: 0.55, ease: 'power2.in' }, 0.3)
        .to(ball, { x: 262, y: 420, scale: 1, duration: 0.26, ease: 'power1.out' }, 0.85)
        .to(bat, { rotation: through, duration: shot.soft ? 0.3 : 0.34, ease: 'power2.in' }, 0.87)
        .to(burst, { scale: shot.soft ? 1 : 1.6, opacity: 1, duration: 0.08 }, 1.11)
        .to(burst, { scale: 2.4, opacity: 0, duration: 0.3 }, 1.19)
        .set(
          ghosts,
          { opacity: (i: number) => (shot.soft ? [0.25, 0.12, 0] : [0.45, 0.28, 0.14])[i] ?? 0, x: 262, y: 420, scale: 1 },
          1.11,
        )
      shot.flight(tl, all)
      if (shot.soft) {
        // A soft shot is run as "1 RUN" then upgraded to "2 RUNS".
        tl.to(label, { scale: 1, duration: 0.4, ease: 'back.out(2.4)' }, 1.6)
          .call(() => addRuns(shot, 1), undefined, 1.65)
          .to(label, { scale: 0.6, duration: 0.15 }, 2.25)
          .call(() => setLabel(shot, shot.label), undefined, 2.4)
          .to(label, { scale: 1, duration: 0.35, ease: 'back.out(2.6)' }, 2.4)
          .call(() => addRuns(shot, 1), undefined, 2.45)
      } else {
        tl.to(label, { scale: 1, duration: 0.5, ease: 'back.out(2.4)' }, 1.45).call(
          () => addRuns(shot, shot.runs),
          undefined,
          1.5,
        )
      }
      tl.to(bat, { rotation: -12, duration: 0.7, ease: 'power2.inOut' }, 1.9)
        .to(label, { opacity: 0, scale: 1.2, duration: 0.35 }, shot.soft ? 3.3 : 3.1)
        .to(all, { opacity: 0, duration: 0.2 }, shot.soft ? 3.3 : 3.1)
    })

  next = () => {
    current?.kill()
    pending?.kill()
    const shot = SHOTS[idx % SHOTS.length]!
    idx += 1
    play(shot)
  }

  ctx.add(() => {
    gsap.to(q('.lamp-glow'), { opacity: 0.55, duration: 1.8, repeat: -1, yoyo: true, ease: 'sine.inOut', stagger: 0.4 })
    pending = gsap.delayedCall(0.6, next)
  })
})

onBeforeUnmount(() => {
  next = () => {}
  ctx?.revert()
})
</script>

<template>
  <div ref="root" class="scene-wrap">
    <svg class="scene" viewBox="0 0 600 520" role="img" aria-label="A batter plays sixes, fours and twos under floodlights">
      <defs>
        <radialGradient id="lampG" cx="50%" cy="50%" r="50%">
          <stop offset="0" stop-color="#FFE7B4" stop-opacity=".9" />
          <stop offset="1" stop-color="#FFF3D1" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#FFE7B4" stop-opacity=".2" />
          <stop offset="1" stop-color="#FFF3D1" stop-opacity="0" />
        </linearGradient>
        <linearGradient id="pitchG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#9C6C3C" />
          <stop offset="1" stop-color="#D8A265" />
        </linearGradient>
        <pattern id="stripes" width="64" height="520" patternUnits="userSpaceOnUse" patternTransform="skewX(-14)">
          <rect width="32" height="520" fill="#1C4A2C" />
          <rect x="32" width="32" height="520" fill="#174226" />
        </pattern>
        <clipPath id="field"><ellipse cx="300" cy="560" rx="560" ry="360" /></clipPath>
        <radialGradient id="ballG" cx="35%" cy="30%" r="70%">
          <stop offset="0" stop-color="#F0575C" />
          <stop offset=".55" stop-color="#C1272D" />
          <stop offset="1" stop-color="#6E1115" />
        </radialGradient>
      </defs>

      <polygon points="70,40 20,520 260,520" fill="url(#beam)" />
      <polygon points="530,40 340,520 590,520" fill="url(#beam)" />
      <g v-for="([x, y], i) in LAMPS" :key="i">
        <line :x1="x" :y1="y + 20" :x2="x + (i ? 18 : -18)" y2="230" stroke="#2C5A40" stroke-width="4" />
        <circle class="lamp-glow" :cx="x" :cy="y" r="46" fill="url(#lampG)" opacity=".9" />
        <rect :x="x - 22" :y="y - 12" width="44" height="24" rx="4" fill="#0A2217" stroke="#FFF3D1" stroke-opacity=".5" />
        <circle v-for="k in [0, 1, 2, 3]" :key="k" :cx="x - 15 + k * 10" :cy="y" r="3.4" fill="#FFF3D1" />
      </g>

      <g clip-path="url(#field)"><rect x="0" y="180" width="600" height="340" fill="url(#stripes)" /></g>
      <ellipse cx="300" cy="560" rx="520" ry="330" fill="none" stroke="#E8AD44" stroke-opacity=".55" stroke-width="2" stroke-dasharray="8 7" />
      <polygon points="276,226 324,226 392,520 208,520" fill="url(#pitchG)" />
      <line x1="266" y1="246" x2="334" y2="246" stroke="#FFF3D1" stroke-width="1.6" opacity=".85" />
      <line x1="214" y1="470" x2="386" y2="470" stroke="#FFF3D1" stroke-width="2.4" opacity=".9" />
      <line x1="236" y1="470" x2="228" y2="520" stroke="#FFF3D1" stroke-width="2" opacity=".7" />
      <line x1="364" y1="470" x2="372" y2="520" stroke="#FFF3D1" stroke-width="2" opacity=".7" />
      <rect v-for="x in [293, 300, 307]" :key="'fs' + x" :x="x - 1.2" y="222" width="2.4" height="18" fill="#FFF3D1" />
      <rect x="291" y="220.5" width="18" height="2" fill="#F4B942" />
      <ellipse cx="306" cy="390" rx="9" ry="3" fill="#7A5230" opacity=".5" />
      <rect v-for="x in [284, 300, 316]" :key="'ns' + x" :x="x - 3.5" y="438" width="7" height="72" rx="2" fill="#FFF3D1" />
      <rect x="279" y="434" width="20" height="5" rx="2" fill="#F4B942" />
      <rect x="301" y="434" width="20" height="5" rx="2" fill="#F4B942" />

      <g id="bat">
        <rect x="258" y="300" width="8" height="44" rx="3" fill="#C92F66" />
        <path d="M252 344h20l3 8v96c0 7-6 12-13 12s-13-5-13-12v-96z" fill="#EBD3A0" />
        <path d="M262 344h10l3 8v96c0 7-6 12-13 12z" fill="#D4B77E" />
        <rect x="251" y="362" width="24" height="6" fill="#C92F66" opacity=".85" />
      </g>
      <circle v-for="i in 3" :key="'g' + i" class="ghost" cx="0" cy="0" r="9" fill="#E0474D" opacity="0" />
      <g id="ball">
        <circle cx="0" cy="0" r="9" fill="url(#ballG)" />
        <path d="M-5 -7c3 4 3 10 0 14M5 -7c-3 4-3 10 0 14" stroke="#FFF3D1" stroke-width="1" stroke-dasharray="1.6 1.6" fill="none" />
      </g>
      <g id="burst">
        <line
          v-for="(l, i) in BURST"
          :key="i"
          :x1="l.x1"
          :y1="l.y1"
          :x2="l.x2"
          :y2="l.y2"
          stroke="#F4B942"
          stroke-width="3"
          stroke-linecap="round"
        />
      </g>
      <g id="shotLabel">
        <text
          id="shotText"
          x="0"
          y="0"
          text-anchor="middle"
          dominant-baseline="middle"
          font-family="Poppins, sans-serif"
          font-weight="600"
          font-size="72"
          letter-spacing="-2"
          fill="#F4B942"
          stroke="#0A2217"
          stroke-width="3"
          paint-order="stroke"
        >
          SIX!
        </text>
      </g>
    </svg>
    <div class="scene-score" aria-hidden="true">
      <b class="num">{{ score.runs }}/0</b>
      <span>MSL XI{{ score.last ? ', last ball ' + score.last.runs : '' }}</span>
    </div>
    <button v-if="!REDUCED" class="btn sm ghost replay" @click="nextBall">Next ball</button>
  </div>
</template>
