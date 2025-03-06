import { defineNuxtConfig } from "nuxt/config";

// https://nuxt.com/docs/api/configuration/nuxt-config
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
  compatibilityDate: "2025-02-27"
})