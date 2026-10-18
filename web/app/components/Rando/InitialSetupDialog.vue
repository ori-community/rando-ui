<template>
  <v-dialog :model-value="wizardDialogOpen" persistent max-width="1000" opacity="1.0">
    <v-card class="overflow-auto">
      <rando-initial-setup-wizard @completed="wizardDialogOpen = false" />
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
  const wizardDialogOpen = ref(false)

  if (useIsElectron()) {
    const settingsStore = useSettingsStore()

    watch(() => settingsStore.isInitialized, (isInitialized) => {
      if (isInitialized) {
        wizardDialogOpen.value = !settingsStore.InitialSetupCompleted
      }
    })
  }
</script>

<style lang="scss" scoped>

</style>
