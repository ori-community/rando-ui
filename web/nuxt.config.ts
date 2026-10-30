import {resolve} from "path"

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: {enabled: true},
  ssr: false,
  experimental: {
    viteEnvironmentApi: true,
  },

  css: [
    "@/assets/vuetify/globals.scss",
    "@/assets/utils/style.scss",
  ],

  app: {
    head: {},
  },

  nitro: {
    compressPublicAssets: import.meta.env.NUXT_COMPRESS_ASSETS === "true",
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
      releasesUrl: "https://ori-rando-update.schwarzer.dev/releases/wotw",
      offerPrereleaseVersions: false,
    },
  },

  alias: {
    "@launcher": resolve(__dirname, "../launcher/src"),
    "@shared": resolve(__dirname, "../shared"),
    "@web": resolve(__dirname, "../web"),
  },

  hooks: {
    "nitro:config": nitroConfig => {
      nitroConfig.publicAssets ||= []
      nitroConfig.publicAssets.push({
        dir: resolve(__dirname, "node_modules/@ori-community/wotw-map/dist"),
        baseURL: "/wotw-map",
        maxAge: 600,  // 10 minutes
      })
    },
  },

  modules: ["@baptistecrouzet/nuxt-oxlint", "@pinia/nuxt", "vuetify-nuxt-module"],

  compatibilityDate: "2024-07-28",
})
