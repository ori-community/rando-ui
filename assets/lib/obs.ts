export const isOBS = () => !!(window as any)?.obsstudio?.pluginVersion

const obsModeStyle = `
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

export const applyOBSStyles = () => {
  const styleElement = document.createElement('style')
  styleElement.innerHTML = obsModeStyle
  styleElement.id = 'obs-mode-style'
  document.head.appendChild(styleElement)
}
