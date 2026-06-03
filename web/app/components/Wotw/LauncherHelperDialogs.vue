<template>
  <v-dialog v-if="currentUnsuccessfulLaunchResult !== null" v-model="unsuccessfulLaunchErrorDialogOpen" max-width="600">
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
        <v-btn @click="unsuccessfulLaunchErrorDialogOpen = false">Close</v-btn>

        <v-dialog max-width="1200">
          <template #activator="{ props: activatorProps }">
            <v-btn v-bind="activatorProps" variant="flat" color="accent">Check setup</v-btn>
          </template>
          <template #default="{ isActive }">
            <v-card class="pa-4">
              <wotw-settings-setup-wizard @setup-finished="isActive.value = false; unsuccessfulLaunchErrorDialogOpen = false" />
            </v-card>
          </template>
        </v-dialog>
      </template>
    </v-card>
  </v-dialog>
  <v-dialog v-if="currentDetectedCrashSupportBundlePath !== null" v-model="gameCrashedDialogOpen" max-width="600">
    <v-card title="Something went oribly wrong">
      <template #text>
        <div class="mb-8">
          It seems like the game crashed... We collected some information and important files that would help us to
          find the issue. Please reach out to one of the developers on our Discord and send them the file.
        </div>
      </template>

      <template #actions>
        <v-btn @click="gameCrashedDialogOpen = false">Close</v-btn>
        <v-btn variant="flat" color="accent" @click="showSupportBundleInExplorer">Show in Explorer</v-btn>
      </template>

      <img class="crash-ori" src="@shared/images/ori_sus.png" alt="">
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
  import type {UnsuccessfulLaunchResult} from '@shared/types/launcher'
  import {launchSetupValidationErrorMessages} from '~/assets/uiMetadata'

  const electronApi = useElectronApi()
  const {onLaunchResult} = useLauncherHelper()
  const unsuccessfulLaunchErrorDialogOpen = ref(false)
  const gameCrashedDialogOpen = ref(false)
  const currentUnsuccessfulLaunchResult = ref<UnsuccessfulLaunchResult | null>(null)
  const currentDetectedCrashSupportBundlePath = ref<string | null>(null)

  onLaunchResult.on((launchResult) => {
    if (!launchResult.launchedSuccessfully) {
      currentUnsuccessfulLaunchResult.value = launchResult
    }

    unsuccessfulLaunchErrorDialogOpen.value = !launchResult.launchedSuccessfully
  })

  async function showSupportBundleInExplorer() {
    if (!electronApi || currentDetectedCrashSupportBundlePath.value === null) {
      return
    }

    await electronApi.shell.showPathInExplorer.query({path: currentDetectedCrashSupportBundlePath.value})
  }

  electronApi?.supportBundle.onSupportBundleCreatedFromCrash.subscribe(undefined, {
    onData(value) {
      currentDetectedCrashSupportBundlePath.value = value
      gameCrashedDialogOpen.value = true
    },
  })
</script>

<style lang="scss" scoped>
  .crash-ori {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 96px;
    transform: scaleX(-1);
  }
</style>
