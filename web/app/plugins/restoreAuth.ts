export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:mounted', async () => {
    await useAuthStore().restoreJwt()
  })
})
