<template>
  <div class="page-toolbar d-flex align-center my-4">
    <v-scale-transition group tag="div" class="flex-gap align-center">
      <v-btn key="home" exact :to="`${isElectron ? `/electron` : `/`}`" size="x-large" variant="text">
        <v-icon>mdi-home-outline</v-icon>
      </v-btn>
    </v-scale-transition>
    <v-spacer/>
    <throttled-spinner no-margin>
      <div class="d-flex align-center">
        <v-btn size="x-large" variant="text" @click="login">
          <v-icon start>mdi-login-variant</v-icon>
          Log in
        </v-btn>
      </div>
    </throttled-spinner>
  </div>
</template>

<script lang="ts" setup>
  const isElectron = useIsElectron()
  const electronApi = isElectron ? useElectronApi() : null
  const authStore = useAuthStore()

  async function login() {
    if (!electronApi) {
      return
    }

    const jwt = await electronApi.auth.startOAuthFlow.query({
      apiBaseUrl: "https://wotw.orirando.com/api"
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
