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
  <v-dialog :model-value="updateDownloadProgress !== null" persistent max-width="600" opacity="1.0">
    <v-card class="pa-12 text-center">
      <template v-if="updateDownloadProgress !== null">
        <h3 class="mb-4">Downloading update...</h3>
        <v-progress-linear class="no-transition" :model-value="updateDownloadProgress" max="1" />
      </template>
    </v-card>
  </v-dialog>
  <v-dialog v-model="statsDialog.open" height="90%" max-width="1250">
    <v-card class="fill-height relative">
      <template v-if="statsDialogError">
        <div class="position-absolute d-flex flex-column ga-2 justify-center align-center top-0 left-0 right-0 bottom-0">
          <div>
            Error loading statistics data from the game. Is the game running?
          </div>
          <v-btn variant="tonal" @click="updateGameStatsSlotData()">Retry</v-btn>
        </div>
      </template>
      <template v-else>
        <wotw-map :loading="gameStatsSlotData === null" :game-stats-slot-data="gameStatsSlotData" />
      </template>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
  import type {UnsuccessfulLaunchResult} from '@shared/types/launcher'
  import {launchSetupValidationErrorMessages} from '~/assets/uiMetadata'
  import type {Unsubscribable} from "@launcher/api/api"

  const electronApi = useElectronApi()
  const {onLaunchResult} = useLauncherHelper()
  const unsuccessfulLaunchErrorDialogOpen = ref(false)
  const gameCrashedDialogOpen = ref(false)
  const currentUnsuccessfulLaunchResult = ref<UnsuccessfulLaunchResult | null>(null)
  const currentDetectedCrashSupportBundlePath = ref<string | null>(null)
  const updateDownloadProgress = ref<number | null>(null)
  const statsDialog = useStatsDialogStore()
  const gameStatsSlotData = shallowRef<ArrayBufferLike | null>(null)
  const statsDialogError = ref(false)
  const onCheckpointUnsubscribable = shallowRef<Unsubscribable | null>(null)

  if (electronApi !== null) {
    watch(() => statsDialog.open, async (open) => {
      if (open) {
        await updateGameStatsSlotData()

        onCheckpointUnsubscribable.value = electronApi.randoIpc.onCheckpointCreated.subscribe(undefined, {
          onData() {
            updateGameStatsSlotData()
          }
        })
      } else {
        onCheckpointUnsubscribable.value?.unsubscribe()
        onCheckpointUnsubscribable.value = null
      }
    })
  }

  onBeforeUnmount(() => {
    onCheckpointUnsubscribable.value?.unsubscribe()
  })

  async function updateGameStatsSlotData() {
    statsDialogError.value = false

    try {
      const response = (await electronApi?.randoIpc.getGameStatsSlotData.query()) ?? null

      if (response === null) {
        statsDialogError.value = true
        return
      }

      gameStatsSlotData.value = new Uint8Array(response).buffer
    } catch (e) {
      console.error(e)
      statsDialogError.value = true
    }
  }

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

  electronApi?.updater.updateDownloadProgress.subscribe(undefined, {
    onData(value) {
      updateDownloadProgress.value = value
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

  .no-transition:deep(*) {
    transition: none !important;
  }
</style>
