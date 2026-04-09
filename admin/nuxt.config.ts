// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'



export default defineNuxtConfig({
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    betterAuthSecret: process.env.BETTER_AUTH_SECRET,
    betterAuthUrl: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
    betterAuthTrustedOrigins: process.env.BETTER_AUTH_TRUSTED_ORIGINS || '',
    betterAuthAdminEmails: process.env.BETTER_AUTH_ADMIN_EMAILS || '',
    betterAuthStaffEmails: process.env.BETTER_AUTH_STAFF_EMAILS || '',
    public: {
      betterAuthUrl: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
    }
  },

  components:{
    dirs: [
      "@/components/"
    ]
  },

  // Redirect root path to Home as default landing page
  routeRules: {
    '/': { redirect: '/Home' }
  },

  compatibilityDate: "2025-02-27",
  modules: ['@nuxtjs/tailwindcss']
})