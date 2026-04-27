import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  extends: 'docus',
  modules: ['@nuxt/ui', '@vueuse/nuxt'],
  devtools: { enabled: false },
  llms: {
    domain: 'http://localhost:3000'
  }
})
