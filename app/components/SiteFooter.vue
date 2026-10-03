<script setup lang="ts">
const { settings } = useLeague()
</script>

<template>
  <footer class="foot">
    <div class="wrap foot-in">
      <div>
        <img class="foot-logo" :src="LOGO" alt="" aria-hidden="true" />
        <b>Malvani Super League</b>
        <span class="mr">{{ NAME_MR }}</span>, season {{ settings.season }}
      </div>
      <div class="foot-right">
        <div v-if="settings.contactPhone">
          Contact {{ settings.contactName ? settings.contactName + ', ' : '' }}{{ settings.contactPhone }}
        </div>
        <div class="credit">
          Web craft by <span class="heart" aria-label="love">💗</span>
          <a href="https://anupkankale.com/" target="_blank" rel="noopener">Anup Kankale</a>
        </div>
      </div>
    </div>
  </footer>
</template>
