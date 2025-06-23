import vuetify, {transformAssetUrls} from "vite-plugin-vuetify"
import {resolve} from "path"

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: {enabled: true},
  ssr: false,

  build: {
    transpile: ["vuetify"],
  },

  alias: {
    "@shared": resolve(__dirname, "../shared"),
  },

  modules: [
    "@nuxt/eslint",
    "@pinia/nuxt",
    (_options, nuxt) => {
      nuxt.hooks.hook("vite:extendConfig", (config) => {
        config.plugins?.push(vuetify({autoImport: true}))
      })
    },
  ],

  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },

  compatibilityDate: "2024-07-28",
})
