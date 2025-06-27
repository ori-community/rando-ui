<template>
  <rando-throttled-spinner />
</template>

<script lang="ts" setup>
  const route = useRoute()
  const router = useRouter()
  const {axios} = useAxios()
  const authStore = useAuthStore()

  const jwt = route.query.jwt

  // Exchange short-lived token with a long-lived one
  if (jwt) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${jwt}`

    authStore.jwt = (await axios.post('/tokens/', {
      scopes: ['*'],
    })).data as string
    // TODO: Update user in userStore

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
