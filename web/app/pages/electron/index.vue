<template>
  <v-container>
    <div class="text-center">
      <div class="buttons justify-center">
        <rando-launch-button icon="mdi-leek" :show-confetti="true" @click="launch()">Lauch
          <v-tooltip location="bottom" activator="parent">This is a hint</v-tooltip>
        </rando-launch-button>
        <rando-launch-button icon="mdi-seed" :show-confetti="true" @click="selectAndLaunchFile()">Saatauswahl
          <v-tooltip location="bottom" activator="parent">This is also a hint</v-tooltip>
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
