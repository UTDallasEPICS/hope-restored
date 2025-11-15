// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'
import tailwindcss from "@tailwindcss/vite";



export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['./app/assets/css/main.css'],
  plugins: [
    '~/qr-code-stuff/vue3-qr-reader.client.ts',
    tailwindcss({
      src: [
        './app.vue',
        './components/**/*.{vue,js,ts}',
        './layouts/**/*.{vue,js,ts}',
        './pages/**/*.{vue,js,ts}',
        './plugins/**/*.{js,ts}',
      ]
    }),
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