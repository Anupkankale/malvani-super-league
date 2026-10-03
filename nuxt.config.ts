const SITE_URL = 'https://malvani-super-league.vercel.app/'
const TITLE = 'Malvani Super League, Season 2026'
const DESCRIPTION = '6 teams. One live auction night. Register as a player and get picked.'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Sealed cookie sessions for the organiser login (needs NUXT_SESSION_PASSWORD in production).
  modules: ['nuxt-auth-utils'],

  // Server-only secrets, set via NUXT_ADMIN_USERNAME / NUXT_ADMIN_PASSWORD.
  // The database uses TURSO_DATABASE_URL / TURSO_AUTH_TOKEN (see server/utils/db.ts).
  runtimeConfig: {
    adminUsername: 'admin',
    adminPassword: '',
  },

  // Client-rendered SPA; league data comes from the /api routes in server/.
  ssr: false,

  // Keep the original #/register, #/auction … links working.
  router: { options: { hashMode: true } },

  css: ['~/assets/css/fonts.css', '~/assets/css/main.css'],

  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Malvani Super League',
      meta: [
        { name: 'viewport', content: 'width=device-width,initial-scale=1,viewport-fit=cover' },
        {
          name: 'description',
          content:
            'Malvani Super League (मालवणी सुपर लीग): register as a player and follow the live auction as 6 teams from the Malvan coast build their squads.',
        },
        { name: 'theme-color', content: '#0A2217' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Malvani Super League' },
        { property: 'og:locale', content: 'en_IN' },
        { property: 'og:url', content: SITE_URL },
        { property: 'og:title', content: TITLE },
        { property: 'og:description', content: DESCRIPTION },
        { property: 'og:image', content: SITE_URL + 'og-image.png' },
        { property: 'og:image:secure_url', content: SITE_URL + 'og-image.png' },
        { property: 'og:image:type', content: 'image/png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: 'Malvani Super League: floodlit cricket pitch with a ball hit for six' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: TITLE },
        { name: 'twitter:description', content: DESCRIPTION },
        { name: 'twitter:image', content: SITE_URL + 'og-image.png' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: 'favicon.svg' },
        { rel: 'apple-touch-icon', href: 'apple-touch-icon.png' },
        { rel: 'canonical', href: SITE_URL },
      ],
    },
  },
})
