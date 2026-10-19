<template>
  <v-window v-model="step" style="min-height: fit-content">
    <v-window-item value="welcome" eager>
      <div class="pa-5 text-center">
        <img class="orihi" alt="" src="@shared/images/ori_hi.png">
        <h2 class="mt-2">Welcome to the Ori and the Will of the Wisps Randomizer!</h2>
        <p>
          Before you can start playing, let's go through some settings to set up the randomizer.
        </p>
      </div>
      <div class="d-flex justify-end pa-5">
        <v-btn variant="flat" color="accent" @click="goToNextStep()">Next</v-btn>
      </div>
    </v-window-item>
    <v-window-item value="launch-setup" eager>
      <div class="pa-5">
        <wotw-settings-setup-wizard
          complete-setup-button-label="Next"
          :complete-setup-button-icon="null"
          @setup-finished="goToNextStep()"
        />
      </div>
    </v-window-item>
    <v-window-item value="tracker" eager>
      <div class="pa-5">
        <h2>Item Tracker</h2>
        <p>
          The Item Tracker is a separate window that helps you keeping track of your collected skills, resources and
          other stats. It can have an opaque or transparent background, allowing it to be displayed as an overlay
          over the game if you want.
        </p>

        <div class="my-3">
          <v-btn variant="flat" color="accent" @click="openDemoTracker">
            <v-icon start>mdi-open-in-app</v-icon>
            Open Live Preview
          </v-btn>
          <v-btn variant="flat" @click="resetTrackerPosition">Reset Tracker Position</v-btn>
        </div>

        <v-item-group v-model="settings.LocalTrackerTransparent" mandatory class="tracker-mode-grid">
          <v-item v-slot="{ isSelected, toggle }" :value="false">
            <v-card :color="isSelected ? 'accent' : ''" class="pa-4" variant="flat" @click="toggle">
              <v-img eager src="~/assets/images/tracker_opaque.avif" />
              <h3 class="text-center mt-2">Opaque Window</h3>
            </v-card>
          </v-item>
          <v-item v-slot="{ isSelected, toggle }" :value="true">
            <div>
              <v-card :color="isSelected ? 'accent' : ''" class="pa-4 mb-2" variant="flat" @click="toggle">
                <v-img eager src="~/assets/images/tracker_transparent.avif" />
                <h3 class="text-center mt-2">Transparent Window</h3>
              </v-card>
              <rando-settings-checkbox
                v-model="settings.LocalTrackerIgnoreMouse"
                :disabled="!settings.LocalTrackerTransparent"
                label="Ignore Mouse"
                description="Allows clicking through the item tracker window. Disable to resize and move the window."
              />
            </div>
          </v-item>
        </v-item-group>
      </div>
      <div class="d-flex justify-end pa-5">
        <v-btn variant="flat" color="accent" @click="goToNextStep()">Next</v-btn>
      </div>
    </v-window-item>
    <v-window-item value="common-settings" eager>
      <div class="pa-5">
        <h2 class="mb-3">Additional Settings</h2>
        <rando-settings-checkbox
          v-model="settings.EnableAutomaticCutsceneSkipping"
          label="Automatic Cutscene Skipping"
          description="Automatically skip cutscenes whenever the 'Skip Cutscene' action is available"
        />
        <rando-settings-checkbox
          v-model="mouseControl"
          label="Mouse Control"
          description="Control Burrow, Grapple and Water Dash with your cursor instead of keyboard keys"
        />
        <rando-settings-checkbox
          v-if="platform === 'linux'"
          v-model="createDesktopEntry"
          label="Create Desktop Entry"
          description="Makes it possible to find the randomizer in your applications list"
        />
      </div>
      <div class="d-flex align-center pa-5">
        <p class="opacity-70 text-label-large">
          More fine grained and additional options are available later in the randomizer settings.
        </p>
        <v-spacer />
        <v-btn variant="flat" color="accent" @click="goToNextStep()">Next</v-btn>
      </div>
    </v-window-item>
    <v-window-item value="done" eager>
      <div class="pa-5 text-center">
        <img ref="oriHiRef" class="orihi" alt="" src="@shared/images/ori_hype.png">
        <h2 class="mt-2">You are ready to go!</h2>
        <p>
          We hope you have fun playing the randomizer!
        </p>
        <div class="pt-6 d-flex justify-center">
          <div class="d-flex flex-column ga-1">
            <v-btn size="x-large" variant="flat" color="accent" class="mb-3" @click="complete({name: 'seedgen'})">
              <v-icon start>mdi-dice-multiple-outline</v-icon>
              Generate a Seed
            </v-btn>
            <v-btn variant="flat" @click="complete({name: 'electron-settings'})">
              <v-icon start>mdi-cog-outline</v-icon>
              Additional Settings
            </v-btn>
            <v-btn variant="flat" @click="complete()">
              <v-icon start>mdi-close</v-icon>
              Close this Dialog
            </v-btn>
          </div>
        </div>
      </div>
    </v-window-item>
  </v-window>
</template>

<script lang="ts" setup>
  import {confettiFromElement} from "~/assets/utils/confetti"
  import type {RouteLocationRaw} from "vue-router"

  const platform = await usePlatform()
  const electronApi = useElectronApi()
  const settings = useSettingsStore()
  const step = ref<'welcome' | 'launch-setup' | 'tracker' | 'common-settings' | 'done'>('welcome')
  const oriHiRef = ref<null | HTMLElement>(null)
  const router = useRouter()
  const createDesktopEntry = ref(true)

  const emit = defineEmits<{
    (e: "completed"): void
  }>()

  watch(() => settings.LocalTrackerTransparent, (value) => {
    if (value) {
      settings.LocalTrackerAlwaysOnTop = true
    } else {
      settings.LocalTrackerIgnoreMouse = false
      settings.LocalTrackerAlwaysOnTop = false
    }
  })

  const mouseControl = computed<boolean>({
    get: () => settings.BurrowMouseControl && settings.GrappleMouseControl && settings.WaterDashMouseControl,
    set(value) {
      settings.BurrowMouseControl = value
      settings.GrappleMouseControl = value
      settings.WaterDashMouseControl = value
    }
  })

  async function goToNextStep() {
    switch (step.value) {
      case "welcome":
        step.value = "launch-setup"
        break
      case "launch-setup":
        step.value = "tracker"
        break
      case "tracker":
        if (electronApi) {
          await electronApi.localTracker.closeWindow.query()
        }
        step.value = "common-settings"
        break
      case "common-settings":
        step.value = "done"
        settings.InitialSetupCompleted = true

        if (platform === "linux" && createDesktopEntry.value && electronApi) {
          await electronApi.fs.createDesktopEntry.query()
        }

        setTimeout(() => {
          if (oriHiRef.value !== null) {
            confettiFromElement(oriHiRef.value)
          }
        }, 500)
        break
    }
  }

  async function openDemoTracker() {
    if (!electronApi) {
      return
    }

    await electronApi.localTracker.openWindow.query({demoMode: true})
  }

  async function resetTrackerPosition() {
    if (!electronApi) {
      return
    }

    await electronApi.localTracker.resetWindowRect.query()
  }

  function complete(to: RouteLocationRaw | null = null) {
    emit("completed")

    if (to !== null) {
      router.push(to)
    }
  }
</script>

<style lang="scss" scoped>
  .orihi {
    max-width: 100px;
  }

  .tracker-mode-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }
</style>
