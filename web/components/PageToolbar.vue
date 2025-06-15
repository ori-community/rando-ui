<template>
  <div class="page-toolbar">
    <v-btn @click="login">Login</v-btn>
  </div>
</template>

<script lang="ts" setup>
  const isElectron = useIsElectron()
  const electronApi = isElectron ? useElectronApi() : null

  async function login() {
    if (!electronApi) {
      return
    }

    const jwt = await electronApi.auth.startOAuthFlow.query({
      apiBaseUrl: "https://wotw.orirando.com/api"
    })
    console.log("JWT:", jwt)
  }
</script>

<style lang="scss" scoped>
  .page-toolbar {
    display: flex;
  }
</style>
