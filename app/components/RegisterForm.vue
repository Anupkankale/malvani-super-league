<script setup lang="ts">
import { gsap } from 'gsap'
import type { Player } from '#shared/utils/league'

const props = defineProps<{ adminMode?: boolean }>()
const emit = defineEmits<{ done: [] }>()

const { store, players, settings } = useLeague()

const emptyForm = () => ({
  name: '',
  mobile: '',
  age: '',
  role: '',
  battingStyle: 'Right-hand',
  bowlingStyle: "Doesn't bowl",
  previousTeam: '',
  photo: '',
  agree: false,
})

const f = reactive(emptyForm())
const errors = ref<Record<string, string | undefined>>({})
const done = ref<Omit<Player, 'id'> | null>(null)
const busy = ref(false)
const photoBusy = ref(false)
const ticket = ref<HTMLElement | null>(null)
const p = props.adminMode ? 'a-' : 'r-'

async function pickPhoto(file: File) {
  photoBusy.value = true
  try {
    f.photo = await compressPhoto(file)
    errors.value = { ...errors.value, photo: undefined }
  } catch (err) {
    errors.value = { ...errors.value, photo: (err as Error).message }
  }
  photoBusy.value = false
}

watch(done, async (v) => {
  if (!v || REDUCED) return
  await nextTick()
  if (ticket.value)
    gsap.from(ticket.value, { rotationY: -80, y: 40, duration: 0.9, ease: 'back.out(1.4)', transformPerspective: 900 })
})

async function submit() {
  // Instant feedback here; the server repeats these checks (and the duplicate-mobile check) before saving.
  const er = validatePlayer(f, players.value, props.adminMode)
  errors.value = er
  if (Object.keys(er).length) return

  busy.value = true
  const { agree, ...rest } = f
  const rec: Omit<Player, 'id'> = {
    ...rest,
    name: f.name.trim(),
    mobile: f.mobile.trim(),
    age: Number(f.age),
    regNo: makeRegNo(),
    status: props.adminMode ? 'approved' : 'pending',
    basePrice: Number(settings.value.basePrice),
    createdAt: Date.now(),
  }
  try {
    done.value = await store.register({ ...rec, agree }) // the server re-checks consent
    Object.assign(f, emptyForm())
    if (props.adminMode) emit('done')
  } catch (err: any) {
    const fieldErrors = err?.data?.data?.errors
    if (fieldErrors) errors.value = fieldErrors
    else
      errors.value = {
        form:
          (err?.statusCode < 500 && err?.data?.message) || // e.g. "Registration is closed"; hide 5xx internals
          (String(err?.name || '').includes('Quota')
            ? 'This device has run out of storage for photos. The organisers need to connect an online database.'
            : "The registration didn't save. Check your connection and submit again."),
      }
  }
  busy.value = false
}
</script>

<template>
  <div v-if="done && !adminMode" class="stack">
    <div ref="ticket" class="ticket">
      <img v-if="done.photo" class="ticket-photo" :src="done.photo" alt="" />
      <span class="tag">Registration received</span>
      <div class="ticket-no">{{ done.regNo }}</div>
      <div class="ticket-name">{{ done.name }}</div>
      <p class="ticket-meta">{{ done.role }}, {{ done.battingStyle }} bat</p>
    </div>
    <p class="muted" style="max-width: 46ch">
      Save this number. The organisers will review your entry; once approved, your name goes into the auction pool.
    </p>
    <div><button class="btn" @click="done = null">Register another player</button></div>
  </div>

  <form v-else class="form" novalidate @submit.prevent="submit">
    <fieldset class="fs">
      <legend class="fs-title">About you</legend>
      <div class="fields">
        <FormField :id="p + 'name'" label="Full name" :error="errors.name">
          <input :id="p + 'name'" v-model="f.name" autocomplete="name" placeholder="e.g. Omkar Parab" />
        </FormField>
        <FormField :id="p + 'mobile'" label="Mobile number" :error="errors.mobile">
          <input :id="p + 'mobile'" v-model="f.mobile" inputmode="numeric" maxlength="10" autocomplete="tel" placeholder="10 digits" />
        </FormField>
        <FormField :id="p + 'age'" label="Age" :error="errors.age">
          <input :id="p + 'age'" v-model="f.age" inputmode="numeric" maxlength="2" />
        </FormField>
      </div>
    </fieldset>

    <fieldset class="fs">
      <legend class="fs-title">Your game</legend>
      <div class="roles" role="radiogroup" aria-label="Playing role">
        <label v-for="r in ROLES" :key="r" class="role" :class="{ on: f.role === r }">
          <input v-model="f.role" type="radio" :name="p + 'role'" :value="r" />
          <RoleIcon :role="r" />
          {{ r }}
        </label>
      </div>
      <em v-if="errors.role" class="err">{{ errors.role }}</em>
      <div class="fields">
        <FormField :id="p + 'bat'" label="Batting">
          <select :id="p + 'bat'" v-model="f.battingStyle">
            <option v-for="x in BAT" :key="x">{{ x }}</option>
          </select>
        </FormField>
        <FormField :id="p + 'bowl'" label="Bowling">
          <select :id="p + 'bowl'" v-model="f.bowlingStyle">
            <option v-for="x in BOWL" :key="x">{{ x }}</option>
          </select>
        </FormField>
        <FormField :id="p + 'prev'" label="Previous team (optional)">
          <input :id="p + 'prev'" v-model="f.previousTeam" />
        </FormField>
      </div>
    </fieldset>

    <fieldset class="fs">
      <legend class="fs-title">Your photo</legend>
      <PhotoPicker :id="p + 'photo'" :value="f.photo" :error="errors.photo" :busy="photoBusy" @pick="pickPhoto" @clear="f.photo = ''" />
    </fieldset>

    <label v-if="!adminMode" class="check" :for="p + 'agree'">
      <input :id="p + 'agree'" v-model="f.agree" type="checkbox" />
      <span>I will be available for all league matches and accept the organisers' decisions.</span>
    </label>
    <em v-if="errors.agree" class="err">{{ errors.agree }}</em>
    <p v-if="errors.form" class="err">{{ errors.form }}</p>
    <div>
      <button class="btn primary lg" :disabled="busy">
        {{ busy ? 'Saving…' : adminMode ? 'Add player' : 'Submit registration' }}
      </button>
    </div>
  </form>
</template>
