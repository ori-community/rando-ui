export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:beforeMount', async () => {
    useHead({
      // This Em Dash was written by human
      titleTemplate: chunk => (
        chunk
          ? "%s — Ori and the Will of the Wisps Randomizer"
          : "Ori and the Will of the Wisps Randomizer"
      )
    })
  })
})
