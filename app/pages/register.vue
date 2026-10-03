<script setup lang="ts">
useHead({ title: 'Player registration · Malvani Super League' })
const { players, settings } = useLeague()
const registered = computed(() => players.value.filter((p) => p.status !== 'rejected').length)
</script>

<template>
  <div class="wrap page">
    <div class="page-head">
      <h1 class="page-title">Player registration</h1>
      <p class="page-sub">One form per player. The organisers approve entries before auction night.</p>
    </div>
    <div class="form-layout">
      <div class="panel">
        <RegisterForm v-if="settings.registrationOpen" />
        <div v-else class="empty">
          Registration is closed for this season. Contact the organisers{{
            settings.contactPhone ? ' on ' + settings.contactPhone : ''
          }}
          if you missed it.
        </div>
      </div>
      <aside class="panel aside-card">
        <h3>Auction rules</h3>
        <ul class="rules">
          <li><span>Base price</span><b>{{ fmt(settings.basePrice) }} {{ settings.unit }}</b></li>
          <li><span>Bid increment</span><b>{{ fmt(settings.increment) }} {{ settings.unit }}</b></li>
          <li><span>Team purse</span><b>{{ fmt(settings.purse) }} {{ settings.unit }}</b></li>
          <li><span>Max squad</span><b>{{ settings.maxSquad }} players</b></li>
          <li><span>Registered so far</span><b>{{ registered }}</b></li>
        </ul>
      </aside>
    </div>
  </div>
</template>
