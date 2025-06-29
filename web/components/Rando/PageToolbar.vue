<template>
  <div class="page-toolbar d-flex align-center my-4">
    <v-scale-transition group tag="div" class="flex-gap align-center">
      <v-btn key="home" exact :to="`${isElectron ? `/electron` : `/`}`" size="x-large" variant="text">
        <v-icon>mdi-home-outline</v-icon>
      </v-btn>
      <v-btn key="league" size="x-large" variant="text" to="/league/seasons">
        <v-icon start>mdi-trophy</v-icon>
        <span class="main-button-text"> League </span>
      </v-btn>
      <template v-if="isElectron">
        <v-btn key="settings" size="x-large" variant="text" to="/electron/settings">
          <v-icon start>mdi-cog-outline</v-icon>
          Settings
        </v-btn>
      </template>
    </v-scale-transition>
    <v-spacer/>
    <rando-throttled-spinner no-margin>
      <div class="d-flex align-center">
        <v-btn size="x-large" variant="text" @click="login">
          <v-icon start>mdi-login-variant</v-icon>
          Log in
        </v-btn>
      </div>
    </rando-throttled-spinner>
  </div>
</template>

<script lang="ts" setup>
  const isElectron = useIsElectron()
  const electronApi = isElectron ? useElectronApi() : null
  const authStore = useAuthStore()
  const route = useRoute()
  const {axios} = useAxios()

  async function login() {
    if (!electronApi) {
      authStore.redirectPath = route.fullPath

      const url = new URL(axios.defaults.baseURL ?? "")
      url.pathname += "/login"
      url.searchParams.set("redirect", `${window.location.origin}/auth/callback`)
      window.location.href = url.href
      return
    }

    const jwt = await electronApi.auth.startOAuthFlow.query({
      apiBaseUrl: "https://wotw.orirando.com/api",
    })

    if (jwt) {
      authStore.jwt = jwt
    }
  }
</script>

<style lang="scss" scoped>
  .page-toolbar {
    gap: 0.2em;
  }
</style>
