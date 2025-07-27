<template>

  <v-row v-if="settingsStore.isInitialized">
    <v-col cols="12" md="6">
      <div class="mb-8">
        <h3>Map</h3>
        <rando-settings-checkbox
          v-model="settings.HideQuestFilter.value"
          label="Hide Quest Filter"
          description="Never show the Quests filter in the in-game map"
        />
        <rando-settings-checkbox
          v-model="settings.HideWarpFilter.value"
          label="Hide Warp Filter"
          description="Never show the Warp filter in the in-game map"
        />
        <rando-settings-checkbox
          v-model="settings.HideCollectableFilter.value"
          label="Hide Collectibles Filter"
          description="Never show the Collectables filter in the in-game map"
        />
        <rando-settings-checkbox
          v-model="settings.AlwaysShowWarps.value"
          label="Always Show Warps"
          description="Always show Spirit Wells on the in-game map, no matter what filter"
        />
        <rando-settings-checkbox
          v-model="settings.AlwaysShowKeystoneDoors.value"
          label="Always Show Keystone Doors"
          description="Always show Keystone Doors on the in-game map, no matter what filter"
        />
        <rando-settings-checkbox
          v-model="showTransparentIcons"
          label="Show Transparent Icons"
          description="Show out of logic icons as transparent"
        />
        <rando-settings-checkbox
          v-model="settings.EnableWorldMap.value"
          label="Disable World Map"
          description="Disables the world map that opens when zooming out"
        />
        <rando-settings-checkbox
          v-model="settings.EnableMinimap.value"
          label="Enable Minimap"
          description="Display an in-game minimap overlay"
        />
        <rando-settings-slider
          v-model="settings.MapPanSpeed.value"
          :min="0.5"
          :max="5"
          :step="0.1"
          label="Map Pan Speed"
          description="Sets how fast the map pans on controller or keyboard"
        />
      </div>
      <div class="mb-8">
        <h3>Miscellaneous</h3>
        <rando-settings-checkbox
          v-model="settings.ShowStatsAfterFinish.value"
          label="Show Stats after Finish"
          description="Show stats in the launcher after finishing a game"
        />
        <rando-settings-checkbox
          v-model="settings.FunnyMoney.value"
          label="Random Currency Names"
          description='Bored of seeing "X Spirit Light"? This setting is for you!'
        />
        <rando-settings-checkbox
          v-model="settings.AlwaysShowKeystones.value"
          label="Always Show Keystones"
          description="Keep your keystone count visible while playing"
        />
        <rando-settings-checkbox
          v-model="settings.SelectInLogicFilterByDefault.value"
          label="Start with In Logic Filter"
          description="Select the In Logic map filter by default instead of the All filter"
        />
        <rando-settings-checkbox
          v-model="settings.ShowAllSecrets.value"
          label="Disable always showing secret areas"
          description="By default, the randomizer shows all secrets without having the Sense Shard equipped"
        />
        <rando-settings-slider
          v-model="settings.CameraShakeIntensity.value"
          :min="0"
          :max="2"
          :step="0.1"
          label="Camera Shake Intensity"
          description="Sets the intensity of camera shakes in the game"
        />
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
          <div v-if="steamPathWarning && !settings.UseMicrosoftStore.value" class="mb-2 mt-2 filepath-warning">
            {{ steamPathWarning }}
          </div>
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
        <rando-settings-checkbox
          v-model="settings.GrappleMouseControl.value"
          label="Grapple Mouse Aiming"
          description="Enables aiming Grapple with your mouse cursor"
        />
        <rando-settings-checkbox
          v-model="settings.BurrowMouseControl.value"
          label="Burrow Mouse Aiming"
          description="Enables aiming Burrow with your mouse cursor"
        />
        <rando-settings-checkbox
          v-model="settings.WaterDashMouseControl.value"
          label="Swimming Mouse Aiming"
          description="Enable Swimming and Water Dashing towards your mouse cursor"
        />
        <rando-settings-checkbox
          v-model="settings.HybridMouseControl.value"
          :disabled="!settings.BurrowMouseControl.value && !settings.WaterDashMouseControl.value"
          label="Hybrid Mouse Control"
          description="Use Mouse Aiming for Burrow and Swimming only when no directional input is pressed. Mouse Aiming needs to be enabled"
        />
        <rando-settings-checkbox
          v-model="settings.InvertFastSwim.value"
          label="Invert Swim Speeds"
          description="Swim fast by default. Hold jump to swim slower instead"
        />
        <rando-settings-checkbox
          v-model="settings.LockCursor.value"
          label="Lock Cursor to Window"
          description="Prevents the mouse cursor from moving outside the game window"
        />
        <rando-settings-checkbox
          v-model="settings.DisableAutoAim.value"
          label="Disable Autoaim"
          description="Disables Autoaiming for Spike, Bow and Shuriken"
        />
        <rando-settings-checkbox
          v-model="settings.EnableNativeControllerSupport.value"
          label="Enable Native Controller Support"
          description="Enables native support for many non-Xbox controllers. Disable this if you have issues."
        />
      </div>
      <div class="mb-8">
        <h3>Tracker</h3>

        <rando-settings-checkbox
          v-model="settings.LaunchWithTracker.value"
          label="Launch with Game"
          description="Automatically open the item tracker when launching the randomizer"
        />

        <rando-settings-checkbox
          v-model="settings.LocalTrackerShowTimer.value"
          label="Show Timer"
          description="Shows the timer for the current game"
        />

        <rando-settings-checkbox
          v-model="settings.LocalTrackerAlwaysOnTop.value"
          label="Always on Top"
          description="Show the Item Tracker on top of other windows"
        />

        <rando-settings-checkbox
          v-model="settings.LocalTrackerTransparent.value"
          label="Transparent Window"
          description="Make the Item Tracker transparent"
        />

        <rando-settings-checkbox
          v-model="settings.LocalTrackerIgnoreMouse.value"
          label="Ignore Mouse"
          description="This is helpful if you want to show the tracker above the game. Note that you cannot move/resize the tracker with this option enabled"
        />

        <rando-settings-checkbox
          v-model="settings.LocalTrackerShowWillowHearts.value"
          label="Show Willow Hearts"
          description="Shows the amount of destroyed willow hearts"
        />

        <v-expand-transition>
          <rando-settings-checkbox
            v-if="settings.LocalTrackerShowWillowHearts.value"
            v-model="settings.LocalTrackerHideHeartsUntilFirstHeart.value"
            label="Hide counter until first heart is destroyed"
            description="Only shows the amount of willow hearts when at least one heart is destroyed"
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
          <rando-settings-checkbox
            v-model="settings.UpdateToPrereleaseVersions.value"
            label="Update to prerelease versions"
            description="Search for and ask to update to unreleased unstable versions"
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

          <rando-settings-checkbox
            v-model="settings.DebugControls.value"
            label="Enable Debug Controls"
            description="Enable Debug Controls by default"
          />
          <v-combobox
            v-model="settings.ServerHost.value"
            class="mt-5"
            label="Server Host"
            :items="['wotw.orirando.com', 'dev.wotw.orirando.com', '127.0.0.1:8081']"
            messages="Press Ctrl+R after changing this setting for it to apply in the launcher"
          />
          <rando-settings-checkbox
            v-model="settings.ServerTLS.value"
            label="Use Secure Connection"
            description="Connect to the Server using HTTPS and WSS instead of HTTP and WS"
          />
          <v-btn color="accent" class="mt-5" @click="disableDeveloperTools"> Disable Developer Tools</v-btn>
        </template>
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts" setup>

  const platform = usePlatform()
  const settingsStore = useSettingsStore()
  const settings = storeToRefs(settingsStore)
  const electronApi = useElectronApi()

  const developerSettingsContainer = useTemplateRef('developerSettingsContainer')
  const debugStreak = ref(0)
  const ctrlPressed = ref(false)
  const localTrackerPositionReset = ref(false)

  const isLinux = computed(() => {
    return platform === "linux"
  })

  const isWindows = computed(() => {
    return platform === "windows"
  })

  const steamPathWarning = computed(() => {
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

  const gameBinaryWarning = computed(() => {
    const filename = getBaseName(settings.GameOrSteamBinaryPath.value)

    if (filename?.toLowerCase() !== 'oriwotw.exe') {
      return 'Warning! Make sure to select the game executable (oriwotw.exe)'
    }
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
    settings.ServerHost.value = "wotw.orirando.com"
    settings.UpdateToPrereleaseVersions.value = false
    settings.DebugControls.value = false
    settings.ServerTLS.value = true
  })

  const getBaseName = ((path: string) => {
    return path?.match(/[\\/]([^\\/]*)$/)?.[1] ?? ''
  })

  // TODO split selection to separate settings
  const selectSteamPath = (async () => {
    const newPath = await electronApi?.systemDialogs.pickFile.query({
      defaultPath: settings.GameOrSteamBinaryPath.value,
      filters: [{name: 'Executables', extensions: ['exe']}]
    })
    if (newPath) {
      settings.GameOrSteamBinaryPath.value = newPath
    }
  })

  const selectGameBinaryPath = (async () => {
    const newPath = await electronApi?.systemDialogs.pickFile.query({
      defaultPath: settings.GameOrSteamBinaryPath.value,
      filters: [{name: 'Executables', extensions: ['exe']}]
    })
    if (newPath) {
      settings.GameOrSteamBinaryPath.value = newPath
    }
  })
  const onKeyUp = ((event: KeyboardEvent) => {
    if (event.key === 'Control') {
      ctrlPressed.value = false
    }
  })

  const onKeyDown = ((event: KeyboardEvent) => {
    if (settingsStore.isInitialized && !settingsStore.DeveloperMode) {
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
