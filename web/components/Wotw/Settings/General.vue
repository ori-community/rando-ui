<template>

  <v-row v-if="settingsStore.isInitialized">
    <v-col cols="12" md="6">
      <div class="mb-8">
        <h3>Map</h3>
        <v-checkbox
            v-model="settings.HideQuestFilter.value"
            label="Hide Quest Filter"
            messages="Never show the Quests filter in the in-game map"
        />
        <v-checkbox
            v-model="settings.HideWarpFilter.value"
            label="Hide Warp Filter"
            messages="Never show the Warp filter in the in-game map"
        />
        <v-checkbox
            v-model="settings.HideCollectableFilter.value"
            label="Hide Collectibles Filter"
            messages="Never show the Collectables filter in the in-game map"
        />
        <v-checkbox
            v-model="settings.AlwaysShowWarps.value"
            label="Always Show Warps"
            messages="Always show Spirit Wells on the in-game map, no matter what filter"
        />
        <v-checkbox
            v-model="settings.AlwaysShowKeystoneDoors.value"
            label="Always Show Keystone Doors"
            messages="Always show Keystone Doors on the in-game map, no matter what filter"
        />
        <v-checkbox
            v-model="showTransparentIcons"
            label="Show Transparent Icons"
            messages="Show out of logic icons as transparent"
        />
        <v-checkbox
            v-model="settings.EnableWorldMap.value"
            label="Disable World Map"
            messages="Disables the world map that opens when zooming out"
        />
        <v-checkbox
            v-model="settings.EnableMinimap.value"
            label="Enable Minimap"
            messages="Display an in-game minimap overlay"
        />
        <v-slider
            v-model="settings.MapPanSpeed.value"
            class="mt-3"
            min="0.5"
            max="5"
            step="0.1"
            show-ticks
            thumb-label
            label="Map Pan Speed"
            messages="Sets how fast the map pans on controller or keyboard"
        />
      </div>
      <div class="mb-8">
        <h3>Miscellaneous</h3>
        <v-checkbox
            v-model="settings.ShowStatsAfterFinish.value"
            label="Show Stats after Finish"
            messages="Show stats in the launcher after finishing a game"
        />
        <v-checkbox
            v-model="settings.FunnyMoney.value"
            label="Random Currency Names"
            messages='Bored of seeing "X Spirit Light"? This setting is for you!'
        />
        <v-checkbox
            v-model="settings.AlwaysShowKeystones.value"
            label="Always Show Keystones"
            messages="Keep your keystone count visible while playing"
        />
        <v-checkbox
            v-model="settings.SelectInLogicFilterByDefault.value"
            label="Start with In Logic Filter"
            messages="Select the In Logic map filter by default instead of the All filter"
        />
        <v-checkbox
            v-model="settings.ShowAllSecrets.value"
            label="Disable always showing secret areas"
            messages="By default, the randomizer shows all secrets without having the Sense Shard equipped"
        />
        <v-slider
            v-model="settings.CameraShakeIntensity.value"
            class="mt-3"
            min="0"
            max="2"
            step="0.1"
            show-ticks
            thumb-label
            label="Camera Shake Intensity"
            messages="Sets the intensity of camera shakes in the game"
        />
        <!-- TODO message using complete width -->
      </div>
      <div class="mb-8">
        <h3>Launch Settings</h3>
        <template v-if="isWindows">
          <div class="mt-3">
            <v-label>Game Distribution Service</v-label>
          </div>
          <v-radio-group
              v-model="settings.UseMicrosoftStore.value"
              row
              class="mt-0"
              messages="Select the game distribution service depending on which version of the game you have"
          >
            <v-radio label="Steam" :value="false"/>
            <v-radio label="Microsoft Store" :value="true"/>
          </v-radio-group>

          <v-text-field
              v-model="settings.GameOrSteamBinaryPath.value"
              readonly
              class="mt-5"
              label="Steam path (steam.exe)"
              append-icon="mdi-folder-search-outline"
              :disabled="settings.UseMicrosoftStore.value"
              hide-details
              @click:append="selectSteamPath"
          />
          <div v-if="steamPathWarning" class="mb-2 mt-2 filepath-warning">{{ steamPathWarning }}</div>
        </template>

        <template v-if="isLinux">
          <v-text-field
              v-model="settings.GameOrSteamBinaryPath.value"
              readonly
              class="mt-5"
              label="Game Binary path (oriwotw.exe)"
              append-icon="mdi-folder-search-outline"
              hide-details
              @click:append="selectGameBinaryPath"
          />
          <div v-if="gameBinaryWarning" class="mb-2 mt-2 filepath-warning">{{ gameBinaryWarning }}</div>
        </template>
      </div>
    </v-col>
    <v-col cols="12" md="6">
      <div class="mb-8">
        <h3>Control Options</h3>
        <v-checkbox
            v-model="settings.GrappleMouseControl.value"
            label="Grapple Mouse Aiming"
            messages="Enables aiming Grapple with your mouse cursor"
        />
        <v-checkbox
            v-model="settings.BurrowMouseControl.value"
            label="Burrow Mouse Aiming"
            messages="Enables aiming Burrow with your mouse cursor"
        />
        <v-checkbox
            v-model="settings.WaterDashMouseControl.value"
            label="Swimming Mouse Aiming"
            messages="Enable Swimming and Water Dashing towards your mouse cursor"
        />
        <v-checkbox
            v-model="settings.HybridMouseControl.value"
            :disabled="!settings.BurrowMouseControl.value && !settings.WaterDashMouseControl.value"
            label="Hybrid Mouse Control"
            messages="Use Mouse Aiming for Burrow and Swimming only when no directional input is pressed. Mouse Aiming needs to be enabled"
        />
        <v-checkbox
            v-model="settings.InvertFastSwim.value"
            label="Invert Swim Speeds"
            messages="Swim fast by default. Hold jump to swim slower instead"
        />
        <v-checkbox
            v-model="settings.LockCursor.value"
            label="Lock Cursor to Window"
            messages="Prevents the mouse cursor from moving outside the game window"
        />
        <v-checkbox
            v-model="settings.DisableAutoAim.value"
            label="Disable Autoaim"
            messages="Disables Autoaiming for Spike, Bow and Shuriken"
        />
        <v-checkbox
            v-model="settings.EnableNativeControllerSupport.value"
            label="Enable Native Controller Support"
            messages="Enables native support for many non-Xbox controllers. Disable this if you have issues."
        />
      </div>
      <div class="mb-8">
        <h3>Tracker</h3>

        <v-checkbox
            v-model="settings.LaunchWithTracker.value"
            label="Launch with Game"
            messages="Automatically open the item tracker when launching the randomizer"
        />

        <v-checkbox
            v-model="settings.LocalTrackerShowTimer.value"
            label="Show Timer"
            messages="Shows the timer for the current game"
        />

        <v-checkbox
            v-model="settings.LocalTrackerAlwaysOnTop.value"
            label="Always on Top"
            messages="Show the Item Tracker on top of other windows"
        />

        <v-checkbox
            v-model="settings.LocalTrackerTransparent.value"
            label="Transparent Window"
            messages="Make the Item Tracker transparent"
        />

        <v-checkbox
            v-model="settings.LocalTrackerIgnoreMouse.value"
            label="Ignore Mouse"
            messages="This is helpful if you want to show the tracker above the game. Note that you cannot move/resize the tracker with this option enabled"
        />

        <v-checkbox
            v-model="settings.LocalTrackerShowWillowHearts.value"
            label="Show Willow Hearts"
            messages="Shows the amount of destroyed willow hearts"
        />

        <v-expand-transition>
          <v-checkbox
              v-if="settings.LocalTrackerShowWillowHearts.value"
              v-model="settings.LocalTrackerHideHeartsUntilFirstHeart.value"
              label="Hide counter until first heart is destroyed"
              messages="Only shows the amount of willow hearts when at least one heart is destroyed"
          />
        </v-expand-transition>

        <v-btn
            depressed
            color="accent"
            class="mt-5"
            :disabled="localTrackerPositionReset"
            @click="resetLocalTrackerPosition"
        >
          <template v-if="localTrackerPositionReset">
            <v-icon left>mdi-check</v-icon>
            Tracker position reset
          </template>
          <template v-else>
            <v-icon left>mdi-restore</v-icon>
            Reset tracker position
          </template>
        </v-btn>
      </div>
      <div ref="developerSettingsContainer" class="mb-8">
        <template v-if="settings.DeveloperMode.value">
          <h3>Developer Tools</h3>
          <v-checkbox
              v-model="settings.UpdateToPrereleaseVersions.value"
              label="Update to prerelease versions"
              messages="Search for and ask to update to unreleased unstable versions"
          />

          <!-- TODO post Update handling
          <v-btn
              v-if="$store.getters['electron/differentVersionAvailable']"
              class="mt-1"
              depressed
              color="accent"
              @click="downloadAndInstallUpdate"
          >
            Install version {{ $store.getters['version/latestVisibleVersion'] }}
          </v-btn>
          -->

          <v-checkbox
              v-model="settings.DebugControls.value"
              label="Enable Debug Controls"
              messages="Enable Debug Controls by default"
          />
          <v-combobox
              v-model="settings.ServerHost.value"
              class="mt-5"
              label="Server Host"
              :items="['wotw.orirando.com', 'dev.wotw.orirando.com', '127.0.0.1:8081']"
              messages="Press Ctrl+R after changing this setting for it to apply in the launcher"
          />
          <v-checkbox
              v-model="settings.ServerTLS.value"
              label="Use Secure Connection"
              messages="Connect to the Server using HTTPS and WSS instead of HTTP and WS"
          />
          <v-btn color="accent" class="mt-5" @click="disableDeveloperTools"> Disable Developer Tools</v-btn>
        </template>
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts" setup>

import {isPlatform, Platform} from "@launcher/helpers";

const settingsStore = useSettingsStore()
const settings = storeToRefs(settingsStore)
const electronApi = useElectronApi()

const developerSettingsContainer = useTemplateRef('developerSettingsContainer')
const debugStreak = ref(0)
const ctrlPressed = ref(false)
const localTrackerPositionReset = ref(false)

const isLinux = computed(() => {
  return isPlatform(Platform.Linux)
})
const isWindows = computed(() => {
  return isPlatform(Platform.Windows)
})

const steamPathWarning = (() => {
  const filename = getBaseName(settings.GameOrSteamBinaryPath.value)

  switch (filename?.toLowerCase()) {
    case 'steam.exe':
      return null
    case 'oriwotw.exe':
      return 'Warning! Depending on your Steam settings, your controller might not work. Please select steam.exe.'
    default:
      return 'Warning! Make sure to select the Steam executable, usually this is steam.exe'
  }
})

const gameBinaryWarning = (() => {
  // const filename = getBaseName(settings.paths.gameBinary) TODO detect OS for binary path
  //
  // if (filename?.toLowerCase() !== 'oriwotw.exe') {
  //   return 'Warning! Make sure to select the game executable (oriwotw.exe)'
  // }
  return null
})

const showTransparentIcons = computed({
  get() {
    return settings.MapIconTransparency.value > 0.0
  },
  set(value) {
    settings.MapIconTransparency.value = value ? 0.25 : 0.0
  }
})

onMounted(() => {
  document.addEventListener('keyup', onKeyUp)
  document.addEventListener('keydown', onKeyDown)
})
onUnmounted(() => {
  document.removeEventListener('keyup', onKeyUp)
  document.removeEventListener('keydown', onKeyDown)
})

const enableDeveloperTools = (() => {
  settings.DeveloperMode.value = true
  debugStreak.value = 0

  developerSettingsContainer.value?.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
  })
})

const disableDeveloperTools = (async () => {
  settings.DeveloperMode.value = false
  await nextTick()
  settings.ServerHost.value = "wotw.orirando.com"
  settings.UpdateToPrereleaseVersions.value = false
  settings.DebugControls.value = false
  settings.ServerTLS.value = true
})

const getBaseName = ((path: string) => {
  return path?.match(/[\\/]([^\\/]*)$/)?.[1] ?? ''
})

const selectSteamPath = (async () => {
  // TODO select directory
  // const newPath = await window.electronApi.invoke('settings.selectSteamPath')
  // if (newPath) {
  //   this.settings['Paths.Steam'] = newPath
  // }
})

const selectGameBinaryPath = (async () => {
  // TODO select directory
  // const newPath = await window.electronApi.invoke('settings.selectGameBinaryPath')
  // if (newPath) {
  //   this.settings['Paths.GameBinary'] = newPath
  // }
})
const onKeyUp = ((event: KeyboardEvent) => {
  if (event.key === 'Control') {
    ctrlPressed.value = false
  }
})

const onKeyDown = ((event: KeyboardEvent) => {
  if (settingsStore.isInitialized && !settings.DeveloperMode) {
    if (event.key === 'Control') {
      if (!ctrlPressed.value) {
        ctrlPressed.value = true
        debugStreak.value++
      }
    } else {
      debugStreak.value = 0
    }

    if (debugStreak.value === 5) {
      enableDeveloperTools()
    }
  }
})


const resetLocalTrackerPosition = (async () => {
  await electronApi?.localTracker.resetWindowRect.query()

  localTrackerPositionReset.value = true

  setTimeout(() => {
    localTrackerPositionReset.value = false
  }, 2000)
})


const downloadAndInstallUpdate = (async () => {
  // TODO post update handling
  // await Promise.all([
  //   this.$router.push({path: '/electron'}),
  //   await this.$store.dispatch('electron/downloadAndInstallUpdate'),
  // ])
})

</script>

<style lang="scss" scoped>
.filepath-warning {
  color: #ffb32f;
  font-weight: bold;
}
</style>
