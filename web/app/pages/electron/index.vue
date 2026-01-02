<template>
  <v-container>
    <div class="text-center">
      <v-btn :loading="isLaunching" @click="launch()">Lauch</v-btn>
      <v-btn :loading="isLaunching" @click="selectAndLaunchFile()">Saatauswahl</v-btn>
    </div>
  </v-container>
</template>

<script setup lang="ts">

  const electronApi = useElectronApi()

  const {isLaunching, launch} = useLauncherHelper()
  const selectAndLaunchFile = (async () => {
    const newPath = await electronApi?.systemDialogs.pickFile.query({
      filters: [{name: 'Seedfiles', extensions: ['wotwr']}],
    })
    if (newPath) {
      launch(`file:${newPath}`)
    }
  })
</script>
