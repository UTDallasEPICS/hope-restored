// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'



export default defineNuxtConfig({
  devtools: { enabled: true },
  plugins: ['~/qr-code-stuff/vue3-qr-reader.client.ts'],
  modules: [
    '@nuxtjs/tailwindcss'
  ],
  components:{
    dirs: [
      "@/components/"
    ]
  },
  // Redirect root path to Home to effectively disable pages/index.vue
  routeRules: {
    '/': { redirect: '/Home' }
  },
  compatibilityDate: "2025-02-27"
})