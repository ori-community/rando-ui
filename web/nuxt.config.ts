import vuetify, {transformAssetUrls} from "vite-plugin-vuetify"
import {resolve} from "path"

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: {enabled: true},
  ssr: false,

  css: ["@/assets/vuetify/globals.scss"],

  runtimeConfig: {
    public: {
      platform: "web",
      webApiBaseUrl: "https://wotw.orirando.com/api"
    }
  },

  build: {
    transpile: ["vuetify"],
  },

  alias: {
    "@launcher": resolve(__dirname, "../launcher/src"),
    "@shared": resolve(__dirname, "../shared"),
    "@web": resolve(__dirname, "../web"),
  },

  modules: [
    "@nuxt/eslint",
    "@pinia/nuxt",
    (_options, nuxt) => {
      nuxt.hooks.hook("vite:extendConfig", (config) => {
        config.plugins?.push(vuetify({
          autoImport: true, styles: {
            configFile: "./assets/vuetify/components.scss",
          },
        }))
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
