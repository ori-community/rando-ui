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
    head: {},
  },

  vuetify: {
    moduleOptions: {
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

  hooks: {
    "nitro:config": nitroConfig => {
      nitroConfig.compressPublicAssets = true
      nitroConfig.publicAssets ||= []
      nitroConfig.publicAssets.push({
        dir: resolve(__dirname, "node_modules/@ori-community/wotw-map/dist"),
        baseURL: "/wotw-map",
        maxAge: 600,  // 10 minutes
      })
    },
  },

  modules: ["@nuxt/eslint", "@pinia/nuxt", "vuetify-nuxt-module"],

  compatibilityDate: "2024-07-28",
})
