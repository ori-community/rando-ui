import colors from 'vuetify/es5/util/colors'
import MonacoEditorWebpackPlugin from 'monaco-editor-webpack-plugin'

const env = {
  API_HOST: process.env.API_HOST || '127.0.0.1:8081',
  API_SECURE: process.env.API_SECURE === 'true',
  UPDATE_PROXY_URL: process.env.UPDATE_PROXY_URL || 'https://ori-rando-update.schwarzer.dev', // TODO: Move to update.orirando.com
}

// Computed envs...
Object.assign(env, {
  API_BASE_URL: (process.env.API_SECURE === 'true' ? 'https://' : 'http://') + env.API_HOST + '/api',
  WS_BASE_URL: (process.env.API_SECURE === 'true' ? 'wss://' : 'ws://') + env.API_HOST + '/api',
})


export default {
  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',
  ssr: false,

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: '%s - Ori Randomizer',
    title: 'Ori Randomizer',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Ori and the Will of the Wisps Randomizer' },
      {
        hid: 'og:description',
        property: 'og:description',
        content: 'Ori and the Will of the Wisps Randomizer',
      },
      { hid: 'og:type', property: 'og:type', content: 'website' },
      { hid: 'og:url', property: 'og:url', content: 'https://wotw.orirando.com' },
      { hid: 'og:title', property: 'og:title', content: 'Ori Randomizer' },
      { hid: 'og:site_name', property: 'og:site_name', content: 'Ori Randomizer' },
      { hid: 'og:image', property: 'og:image', content: 'https://wotw.orirando.com/icon.png' },
      { hid: 'apple-mobile-web-app-title', property: 'apple-mobile-web-app-title', content: 'Ori Randomizer' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    ],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '~/plugins/restoreAuthState.js'
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify',
    '@nuxtjs/pwa',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
  ],

  env,

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    baseURL: env.API_BASE_URL,
  },

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    manifest: {
      lang: 'en',
    },
  },

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    treeShake: true,
    customVariables: ['@/assets/style/variables.scss'],
    theme: {
      dark: true,
      options: {
        customProperties: true,
      },
      themes: {
        dark: {
          background: '#050E17',
          primary: '#7ec6f9',
          secondary: '#155BA2',
          accent: '#533CA6',
          accent2: '#D989D3',
          info: '#5199CD',
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3,
        },
      },
    },
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    plugins: [
      new MonacoEditorWebpackPlugin({
        languages: [],
      }),
    ],
    extend(config, ctx) {
      config.module.rules.push({
        test: /\.ya?ml$/,
        use: 'js-yaml-loader',
      })
    },
  },

  router: {
    mode: process.env.IS_ELECTRON === 'true' ? 'hash' : 'history'
  },
}
