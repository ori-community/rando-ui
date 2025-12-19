<template>
  <v-dialog v-if="currentUnsuccessfulLaunchResult != null" v-model="errorDialogOpen" max-width="600">
    <v-card title="Unable to launch">
      <template #text>
        The randomizer is unable to launch due to the following errors:

        <template v-if="currentUnsuccessfulLaunchResult.errorType === 'setup_validation_errors'">
          <v-alert
            v-for="(error, index) in currentUnsuccessfulLaunchResult.setupValidationErrors"
            :key="index"
            variant="flat"
            density="compact"
            color="error"
            class="mt-2"
          >
            {{ launchSetupValidationErrorMessages[error] }}
          </v-alert>
        </template>
        <template v-else-if="currentUnsuccessfulLaunchResult.errorType === 'unknown_error'">
          <v-alert
            variant="flat"
            density="compact"
            color="error"
            class="mt-2"
          >
            {{ currentUnsuccessfulLaunchResult.errorMessage }}
          </v-alert>
        </template>

        <div class="mt-3">
          Please re-run the setup wizard and try again.
        </div>
      </template>

      <template #actions>
        <v-btn @click="errorDialogOpen = false">Close</v-btn>

        <v-dialog>
          <template #activator="{ props: activatorProps }">
            <v-btn v-bind="activatorProps" variant="flat" color="accent" @click="setupWizardDialogOpen = true">Check setup</v-btn>
          </template>
          <template #default="{ isActive }">
            <v-card class="pa-4">
              <wotw-settings-setup-wizard @setup-finished="isActive.value = false; errorDialogOpen = false" />
            </v-card>
          </template>
        </v-dialog>
      </template>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
  import type {UnsuccessfulLaunchResult} from '@shared/types/launcher'
  import {launchSetupValidationErrorMessages} from '~/assets/uiMetadata'

  const {onLaunchResult} = useLauncherHelper()
  const errorDialogOpen = ref(false)
  const setupWizardDialogOpen = ref(false)
  const currentUnsuccessfulLaunchResult = ref<UnsuccessfulLaunchResult | null>(null)

  onLaunchResult.on((launchResult) => {
    if (!launchResult.launchedSuccessfully) {
      currentUnsuccessfulLaunchResult.value = launchResult
    }

    errorDialogOpen.value = !launchResult.launchedSuccessfully
  })
</script>

<style lang="scss" scoped>

</style>
