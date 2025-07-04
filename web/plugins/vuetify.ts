// import this after install `@mdi/font` package
import "@mdi/font/css/materialdesignicons.css"

import {createVuetify} from "vuetify"
import colors from "vuetify/util/colors"

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    defaults: {
      VSwitch: {
        color: "primary",
      },
      VCheckbox: {
        color: "primary",
      },
      VSlider: {
        color: "primary",
      },
    },
    theme: {
      defaultTheme: "dark",
      themes: {
        dark: {
          dark: true,
          colors: {
            background: "#050E17",
            primary: "#7ec6f9",
            secondary: "#155BA2",
            accent: "#533CA6",
            accent2: "#D989D3",
            info: "#5199CD",
            warning: colors.orange.base,
            error: colors.deepOrange.accent4,
            success: colors.green.accent3,
          },
        },
      },
      variations: {
        colors: ["background", "primary", "accent", "info", "warning", "error", "success"],
        lighten: 5,
        darken: 5,
      },
    },
  })

  app.vueApp.use(vuetify)
})
