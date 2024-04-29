// import this after install `@mdi/font` package
import '@mdi/font/css/materialdesignicons.css'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import colors from 'vuetify/util/colors'

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    theme: {
      defaultTheme: 'dark',
      themes: {
        dark: {
          dark: true,
          colors: {
            background: '#050E17',
            primary: '#7ec6f9',
            secondary: '#155BA2',
            accent: '#533CA6',
            accent2: '#D989D3',
            info: '#5199CD',
            warning: colors.orange.base,
            error: colors.deepOrange.accent4,
            success: colors.green.accent3,
          },
        },
      },
    }
  })
  app.vueApp.use(vuetify)
})
