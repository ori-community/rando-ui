<template>
  <v-container>
    <div class="text-center">
      <div class="buttons justify-center">
        <rando-launch-button hint="This is a hint" icon="mdi-leek">Lauch</rando-launch-button>
        <rando-launch-button hint="This is also a hint" icon="mdi-seed" :handle="selectAndLaunchFile">Saatauswahl
        </rando-launch-button>
      </div>
    </div>
  </v-container>
</template>

<script setup lang="ts">

  const electronApi = useElectronApi()

  const {launch} = useLauncherHelper()
  const selectAndLaunchFile = (async () => {
    const newPath = await electronApi?.systemDialogs.pickFile.query({
      filters: [{name: 'Seedfiles', extensions: ['wotwr']}],
    })
    if (newPath) {
      launch(`file:${newPath}`)
    }
  })
</script>

<style lang="scss" scoped>
  .buttons {
    display: flex;
    gap: 0.4em;
  }
</style>
