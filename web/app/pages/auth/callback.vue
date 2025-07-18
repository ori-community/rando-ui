<template>
  <rando-throttled-spinner />
</template>

<script lang="ts" setup>
  const route = useRoute()
  const router = useRouter()
  const {axios} = useAxios()
  const authStore = useAuthStore()

  const shortLivedJwt = route.query.jwt

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
        // Noop
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
