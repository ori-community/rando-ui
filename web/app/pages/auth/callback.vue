<template>
  <rando-throttled-spinner />
</template>

<script lang="ts" setup>
  const route = useRoute()
  const router = useRouter()
  const {axios} = useAxios()
  const authStore = useAuthStore()
  const isElectron = useIsElectron()

  const shortLivedJwt = route.query.jwt

  async function goHome() {
    await router.replace(
      isElectron
        ? {name: "electron-index"}
        : {name: "index"}
    )
  }

  // Exchange short-lived token with a long-lived one
  if (shortLivedJwt) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${shortLivedJwt}`

    const longLivedJwt = (await axios.post('/tokens/', {
      scopes: ['*'],
    })).data as string
    await authStore.setJwt(longLivedJwt)

    if (authStore.redirectPath !== null) {
      try {
        const redirectPath = authStore.redirectPath
        authStore.redirectPath = null
        await router.replace(redirectPath)
      } catch (e) {
        console.error(e)
        await goHome()
      }
    } else {
      await goHome()
    }
  }
</script>

<style lang="scss" scoped>

</style>
