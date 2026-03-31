import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  extends: 'docus',
  devtools: { enabled: false },
  llms: {
    domain: 'http://localhost:3000'
  }
})
