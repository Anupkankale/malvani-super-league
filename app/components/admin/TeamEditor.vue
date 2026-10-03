<script setup lang="ts">
import type { Team } from '#shared/utils/league'

const props = defineProps<{ team?: Team }>()
const emit = defineEmits<{ save: [data: Omit<Team, 'id'>]; cancel: [] }>()
const { settings } = useLeague()

const t = reactive({
  name: '',
  short: '',
  owner: '',
  color: '#3B82F6',
  purse: String(settings.value.purse),
  ...(props.team ? { ...props.team, purse: String(props.team.purse) } : {}),
})
const k = props.team ? props.team.id : 'new'

function save() {
  emit('save', {
    name: t.name.trim(),
    short: t.short.trim(),
    owner: t.owner.trim(),
    color: t.color,
    purse: Number(t.purse) || 0,
  })
}
</script>

<template>
  <div class="stack">
    <div class="fields">
      <FormField :id="'te-name-' + k" label="Team name">
        <input :id="'te-name-' + k" v-model="t.name" />
      </FormField>
      <FormField :id="'te-short-' + k" label="Short code">
        <input :id="'te-short-' + k" :value="t.short" maxlength="4" @input="t.short = ($event.target as HTMLInputElement).value.toUpperCase()" />
      </FormField>
      <FormField :id="'te-owner-' + k" label="Owner">
        <input :id="'te-owner-' + k" v-model="t.owner" />
      </FormField>
      <FormField :id="'te-purse-' + k" :label="`Purse (${settings.unit})`">
        <input :id="'te-purse-' + k" inputmode="numeric" :value="t.purse" @input="t.purse = digitsOnly($event)" />
      </FormField>
      <FormField :id="'te-color-' + k" label="Team colour">
        <input :id="'te-color-' + k" v-model="t.color" type="color" />
      </FormField>
    </div>
    <div class="actions" style="margin-top: 0">
      <button class="btn primary" :disabled="!t.name.trim() || !t.short.trim()" @click="save">Save team</button>
      <button class="btn" @click="emit('cancel')">Cancel</button>
    </div>
  </div>
</template>
