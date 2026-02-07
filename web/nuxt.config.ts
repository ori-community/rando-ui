import {resolve} from "path"

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: {enabled: true},
  ssr: false,

  css: [
    "@/assets/vuetify/globals.scss",
    "@/assets/utils/style.scss",
  ],

  app: {
    head: {
      // This Em Dash was written by human
      titleTemplate: "%s — Ori and the Will of the Wisps Randomizer",
    },
  },

  vuetify: {
    moduleOptions: {
      disableVuetifyStyles: true,
      styles: {
        configFile: "./assets/vuetify/components.scss",
      },
    },
  },

  runtimeConfig: {
    public: {
      baseUrl: "https://wotw.orirando.com",
    },
  },

  alias: {
    "@launcher": resolve(__dirname, "../launcher/src"),
    "@shared": resolve(__dirname, "../shared"),
    "@web": resolve(__dirname, "../web"),
  },

  modules: ["@nuxt/eslint", "@pinia/nuxt", "vuetify-nuxt-module"],

  compatibilityDate: "2024-07-28",
})
