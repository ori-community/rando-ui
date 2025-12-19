<template>
  <v-container>
    <div class="text-center">
      <v-btn @click="launch">Lauch</v-btn>
    </div>
  </v-container>
</template>

<script setup lang="ts">
  const electronApi = useElectronApi()

  async function launch() {
    if (!electronApi) {
      return
    }

    const result = await electronApi.launcher.launchOrFocusRandomizer.query()

    console.log(result)

    if (result.launchedSuccessfully) {
      return
    }
  }
</script>
