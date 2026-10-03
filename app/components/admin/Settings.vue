<script setup lang="ts">
import type { Settings } from '#shared/utils/league'

const { store, settings, players, teams } = useLeague()

// Local draft; numeric fields are edited as digit strings and converted on save.
type Draft = Omit<Settings, 'purse' | 'basePrice' | 'increment' | 'maxSquad'> &
  Record<'purse' | 'basePrice' | 'increment' | 'maxSquad', string | number>
const s = reactive<Draft>({ ...settings.value })
const saved = ref(false)

watch(
  () => JSON.stringify(settings.value),
  () => Object.assign(s, settings.value),
)

async function save() {
  await store.set('meta', 'settings', {
    ...s,
    purse: Number(s.purse),
    basePrice: Number(s.basePrice),
    increment: Number(s.increment),
    maxSquad: Number(s.maxSquad),
  })
  saved.value = true
  setTimeout(() => (saved.value = false), 2000)
}

const toggleReg = () =>
  store.set('meta', 'settings', { ...settings.value, registrationOpen: !settings.value.registrationOpen })

const applyPurse = () => teams.value.forEach((t) => store.update('teams', t.id, { purse: Number(s.purse) }))

async function resetAuction() {
  for (const p of players.value.filter((x) => x.status === 'sold' || x.status === 'unsold'))
    await store.update('players', p.id, { status: 'approved', soldTo: null, soldPrice: null, soldAt: null })
  store.set('meta', 'auction', { status: 'idle' })
}

const textFields = [
  { key: 'season', id: 'st-season', label: 'Season' },
  { key: 'venue', id: 'st-venue', label: 'Venue' },
  { key: 'auctionDate', id: 'st-date', label: 'Auction date', hint: 'Shown on Home and About, e.g. 12 October, 7 pm' },
  { key: 'contactName', id: 'st-cname', label: 'Contact name' },
  { key: 'contactPhone', id: 'st-cphone', label: 'Contact phone' },
] as const

const ruleFields = [
  { key: 'purse', id: 'st-purse', label: 'Default team purse', numeric: true },
  { key: 'basePrice', id: 'st-base', label: 'Default base price', numeric: true },
  { key: 'increment', id: 'st-inc', label: 'Bid increment', numeric: true },
  { key: 'maxSquad', id: 'st-squad', label: 'Max squad size', numeric: true },
  { key: 'unit', id: 'st-unit', label: 'Currency label', hint: 'e.g. pts or ₹', numeric: false },
] as const
</script>

<template>
  <div class="stack">
    <div class="panel">
      <div class="toolbar" style="margin-bottom: 0">
        <div>
          <h3 style="margin-bottom: 4px">Registration is {{ settings.registrationOpen ? 'open' : 'closed' }}</h3>
          <p class="muted small">
            {{ settings.registrationOpen ? 'Anyone can submit the player form.' : 'The form is hidden from the Registration page.' }}
          </p>
        </div>
        <button class="btn" :class="{ primary: !settings.registrationOpen }" @click="toggleReg">
          {{ settings.registrationOpen ? 'Close registration' : 'Open registration' }}
        </button>
      </div>
    </div>

    <div class="panel form">
      <h3 style="margin-bottom: 0">League details</h3>
      <div class="fields">
        <FormField v-for="f in textFields" :id="f.id" :key="f.id" :label="f.label" :hint="'hint' in f ? f.hint : undefined">
          <input :id="f.id" v-model="s[f.key]" />
        </FormField>
      </div>
      <h3 style="margin-bottom: 0; margin-top: 8px">Auction rules</h3>
      <div class="fields">
        <FormField v-for="f in ruleFields" :id="f.id" :key="f.id" :label="f.label" :hint="'hint' in f ? f.hint : undefined">
          <input
            v-if="f.numeric"
            :id="f.id"
            inputmode="numeric"
            :value="s[f.key]"
            @input="(s as any)[f.key] = digitsOnly($event)"
          />
          <input v-else :id="f.id" v-model="s.unit" />
        </FormField>
      </div>
      <div class="actions" style="margin-top: 0">
        <button class="btn primary" @click="save">{{ saved ? 'Saved' : 'Save settings' }}</button>
        <ConfirmButton label="Apply purse to all teams" btn-class="btn" @confirm="applyPurse" />
      </div>
    </div>

    <div class="panel">
      <h3>Start the auction over</h3>
      <p class="muted" style="margin-bottom: 14px">
        Returns every sold and unsold player to the pool and clears the live board. Registrations and teams stay.
      </p>
      <ConfirmButton label="Reset auction" btn-class="btn danger" @confirm="resetAuction" />
    </div>
  </div>
</template>
