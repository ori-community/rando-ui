export const isOBS = () => !!(window as any)?.obsstudio?.pluginVersion

const transparentOverlayStyle = `
  :root {
    --v-background-base: transparent !important;
  }

  html {
    overflow: hidden; /* doesn't work sometimes for reasons */
  }

  .v-application {
    background-color: transparent !important;
  }

  footer {
    display: none;
  }
  `

export const applyTransparentWindowStyles = () => {
  const styleElement = document.createElement('style')
  styleElement.innerHTML = transparentOverlayStyle
  styleElement.id = 'transparent-overlay-style'
  document.head.appendChild(styleElement)
}
