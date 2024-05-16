<template>
  <v-row v-if="settings !== null && settingsLoaded">
    <v-col cols="12" md="6">
      <div class="mb-8">
        <h3>Map</h3>
        <v-checkbox
          v-model="settings['Flags.HideQuestFilter']"
          label="Hide Quest Filter"
          messages="Never show the Quests filter in the in-game map"
        />
        <v-checkbox
          v-model="settings['Flags.HideWarpFilter']"
          label="Hide Warp Filter"
          messages="Never show the Warp filter in the in-game map"
        />
        <v-checkbox
          v-model="settings['Flags.HideCollectableFilter']"
          label="Hide Collectibles Filter"
          messages="Never show the Collectables filter in the in-game map"
        />
        <v-checkbox
          v-model="settings['Flags.AlwaysShowWarps']"
          label="Always Show Warps"
          messages="Always show Spirit Wells on the in-game map, no matter what filter"
        />
        <v-checkbox
          v-model="settings['Flags.AlwaysShowKeystoneDoors']"
          label="Always Show Keystone Doors"
          messages="Always show Keystone Doors on the in-game map, no matter what filter"
        />
        <v-checkbox
          v-model="showTransparentIcons"
          label="Show Transparent Icons"
          messages="Show out of logic icons as transparent"
        />
        <v-checkbox
          v-model="disableWorldMap"
          label="Disable World Map"
          messages="Disables the world map that opens when zooming out"
        />
        <v-checkbox
          v-model="settings['Flags.EnableMinimap']"
          label="Enable Minimap"
          messages="Display an in-game minimap overlay"
        />
      </div>
      <div class="mb-8">
        <h3>Miscellaneous</h3>
        <v-checkbox
          v-model="settings['Flags.ShowStatsAfterFinish']"
          label="Show Stats after Finish"
          messages="Show stats in the launcher after finishing a game"
        />
        <v-checkbox
          v-model="useRandomCurrencyNames"
          label="Random Currency Names"
          messages='Bored of seeing "X Spirit Light"? This setting is for you!'
        />
        <v-checkbox
          v-model="settings['Flags.AlwaysShowKeystones']"
          label="Always Show Keystones"
          messages="Keep your keystone count visible while playing"
        />
        <v-checkbox
          v-model="settings['Flags.SelectInLogicFilterByDefault']"
          label="Start with In Logic Filter"
          messages="Select the In Logic map filter by default instead of the All filter"
        />
        <v-checkbox
          v-model="settings['Flags.DisableShowSecrets']"
          label="Disable always showing secret areas"
          messages="By default, the randomizer shows all secrets without having the Sense Shard equipped"
        />
        <v-slider
          v-model="settings['Values.CameraShakeIntensity']"
          class="mt-3"
          min="0"
          max="2"
          step="0.1"
          ticks
          thumb-label
          label="Camera Shake Intensity"
          messages="Sets the intensity of camera shakes in the game"
        />
      </div>
      <div class="mb-8">
        <h3>Launch Settings</h3>
        <template v-if="isWindows">
          <div class="mt-3">
            <v-label>Game Distribution Service</v-label>
          </div>
          <v-radio-group
            row
            class="mt-0"
            v-model="settings['Flags.UseWinStore']"
            messages="Select the game distribution service depending on which version of the game you have"
          >
            <v-radio label="Steam" :value="false" />
            <v-radio label="Microsoft Store" :value="true" />
          </v-radio-group>

          <v-text-field
            v-model="settings['Paths.Steam']"
            readonly
            class="mt-5"
            label="Steam path (steam.exe)"
            append-icon="mdi-folder-search-outline"
            @click:append="selectSteamPath"
            :disabled="settings['Flags.UseWinStore']"
            hide-details
          />
          <div v-if="steamPathWarning" class="mb-2 mt-2 filepath-warning">{{ steamPathWarning }}</div>
        </template>

        <template v-if="isLinux">
          <v-text-field
            v-model="settings['Paths.GameBinary']"
            readonly
            class="mt-5"
            label="Game Binary path (oriwotw.exe)"
            append-icon="mdi-folder-search-outline"
            @click:append="selectGameBinaryPath"
            hide-details
          />
          <div v-if="gameBinaryWarning" class="mb-2 mt-2 filepath-warning">{{ gameBinaryWarning }}</div>
        </template>

        <v-checkbox
          v-model="settings['Flags.DisableNetcode']"
          label="Disable Netcode"
          messages="Checking this option prevents the randomizer from communicating with the rando server. With netcode disabled, bingo autotracking and other networked features will be unavailable."
        />
      </div>
    </v-col>
    <v-col cols="12" md="6">
      <div class="mb-8">
        <h3>Control Options</h3>
        <v-checkbox
          v-model="settings['Flags.GrappleMouseControl']"
          label="Grapple Mouse Aiming"
          messages="Enables aiming Grapple with your mouse cursor"
        />
        <v-checkbox
          v-model="settings['Flags.BurrowMouseControl']"
          label="Burrow Mouse Aiming"
          messages="Enables aiming Burrow with your mouse cursor"
        />
        <v-checkbox
          v-model="settings['Flags.WaterDashMouseControl']"
          label="Swimming Mouse Aiming"
          messages="Enable Swimming and Water Dashing towards your mouse cursor"
        />
        <v-checkbox
          v-model="settings['Flags.HybridMouseControl']"
          :disabled="!settings['Flags.BurrowMouseControl'] && !settings['Flags.WaterDashMouseControl']"
          label="Hybrid Mouse Control"
          messages="Use Mouse Aiming for Burrow and Swimming only when no directional input is pressed. Mouse Aiming needs to be enabled"
        />
        <v-checkbox
          v-model="settings['Flags.InvertSwim']"
          label="Invert Swim Speeds"
          messages="Swim fast by default. Hold jump to swim slower instead"
        />
        <v-checkbox
          v-model="settings['Flags.CursorLock']"
          label="Lock Cursor to Window"
          messages="Prevents the mouse cursor from moving outside the game window"
        />
        <v-checkbox
          v-model="settings['Flags.DisableAutoAim']"
          label="Disable Autoaim"
          messages="Disables Autoaiming for Spike, Bow and Shuriken"
        />
      </div>
      <div class="mb-8">
        <h3>Tracker</h3>

        <v-checkbox
          v-model="settings['Flags.LaunchWithTracker']"
          label="Launch with Game"
          messages="Automatically open the item tracker when launching the randomizer"
        />

        <v-checkbox
          v-model="settings['LocalTracker.ShowTimer']"
          label="Show Timer"
          messages="Shows the timer for the current game"
        />

        <v-checkbox
          v-model="settings['LocalTracker.AlwaysOnTop']"
          label="Always on Top"
          messages="Show the Item Tracker on top of other windows"
        />

        <v-checkbox
          v-model="settings['LocalTracker.Transparent']"
          label="Transparent Window"
          messages="Make the Item Tracker transparent"
        />

        <v-checkbox
          v-model="settings['LocalTracker.IgnoreMouse']"
          label="Ignore Mouse"
          messages="This is helpful if you want to show the tracker above the game. Note that you cannot move/resize the tracker with this option enabled"
        />

        <v-checkbox
          v-model="settings['LocalTracker.ShowWillowHearts']"
          label="Show Willow Hearts"
          messages="Shows the amount of destroyed willow hearts"
        />

        <v-expand-transition>
          <v-checkbox
            v-if="settings['LocalTracker.ShowWillowHearts']"
            v-model="settings['LocalTracker.HideHeartsUntilFirstHeart']"
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
      <div ref="developerSettings" class="mb-8">
        <template v-if="settings['Flags.Dev']">
          <h3>Developer Tools</h3>
          <v-checkbox
            v-model="settings['Flags.UpdateToPrereleaseVersions']"
            label="Update to prerelease versions"
            messages="Search for and ask to update to unreleased unstable versions"
          />

          <v-btn
            v-if="$store.getters['electron/differentVersionAvailable']"
            class="mt-1"
            depressed
            color="accent"
            @click="downloadAndInstallUpdate"
          >
            Install version {{ $store.getters['version/latestVisibleVersion'] }}
          </v-btn>

          <v-checkbox
            v-model="settings['Flags.WaitForDebugger']"
            label="Wait for Debugger"
            messages="The Randomizer will wait for a debugger to attach before initialization"
          />
          <v-checkbox
            v-model="enableDebugControls"
            label="Enable Debug Controls"
            messages="Enable Debug Controls by default"
          />
          <v-combobox
            class="mt-5"
            @change="hostChanged"
            label="Server Host"
            v-model="settings['Paths.Host']"
            :items="['wotw.orirando.com', 'dev.wotw.orirando.com', '127.0.0.1:8081']"
            messages="Press Ctrl+R after changing this setting for it to apply in the launcher"
          ></v-combobox>
          <v-combobox
            label="UDP Port"
            v-model="settings['Paths.UdpPort']"
            :items="['31415', '31416', '52423']"
            hide-details
          ></v-combobox>
          <v-checkbox
            v-model="useSecureConnection"
            label="Use Secure Connection"
            messages="Connect to the Server using HTTPS and WSS instead of HTTP and WS"
          />
          <v-btn depressed color="accent" class="mt-5" @click="disableDevTools"> Disable Developer Tools </v-btn>
        </template>
      </div>
    </v-col>
  </v-row>
</template>

<script>
  import { hasSettings } from '~/assets/lib/hasSettings'
  import { isOS, Platform } from '~/assets/lib/os'

  export default {
    mixins: [hasSettings],
    data: () => ({
      debugStreak: 0,
      localTrackerPositionReset: false,
    }),
    head: () => ({
      title: 'WotwRandoSettings',
    }),
    computed: {
      isLinux: () => isOS(Platform.Linux),
      isWindows: () => isOS(Platform.Windows),
      steamPathWarning() {
        const filename = this.getBaseName(this.settings['Paths.Steam'])

        switch (filename?.toLowerCase()) {
          case 'steam.exe':
            return null
          case 'oriwotw.exe':
            return 'Warning! Depending on your Steam settings, your controller might not work. Please select steam.exe.'
          default:
            return 'Warning! Make sure to select the Steam executable, usually this is steam.exe'
        }
      },
      gameBinaryWarning() {
        const filename = this.getBaseName(this.settings['Paths.GameBinary'])

        if (filename?.toLowerCase() !== 'oriwotw.exe') {
          return 'Warning! Make sure to select the game executable (oriwotw.exe)'
        }
        return null
      },
      useRandomCurrencyNames: {
        get() {
          return !this.settings['Flags.BoringMoney']
        },
        set(value) {
          this.settings['Flags.BoringMoney'] = !value
        },
      },
      disableWorldMap: {
        get() {
          return !this.settings['Flags.WorldMapEnabled']
        },
        set(value) {
          this.settings['Flags.WorldMapEnabled'] = !value
        },
      },
      enableDebugControls: {
        get() {
          return !this.settings['Flags.DisableDebugControls']
        },
        set(value) {
          this.settings['Flags.DisableDebugControls'] = !value
        },
      },
      showTransparentIcons: {
        get() {
          return this.settings['Values.MapIconTransparency'] > 0.0
        },
        set(value) {
          this.settings['Values.MapIconTransparency'] = value ? 0.25 : 0.0
        },
      },
      useSecureConnection: {
        get() {
          return !this.settings['Flags.Insecure']
        },
        set(value) {
          this.settings['Flags.Insecure'] = !value
        },
      },
    },
    mounted() {
      document.addEventListener('keyup', this.onKeyUp)
      document.addEventListener('keydown', this.onKeyDown)
    },
    beforeDestroy() {
      document.removeEventListener('keyup', this.onKeyUp)
      document.removeEventListener('keydown', this.onKeyDown)
    },
    methods: {
      enableDevTools() {
        this.settings['Flags.Dev'] = true
        this.debugStreak = 0

        this.$nextTick(() => {
          this.$refs.developerSettings.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          })
        })
      },
      disableDevTools() {
        this.settings['Flags.Dev'] = false
        this.$nextTick(() => {
          this.settings['Flags.WaitForDebugger'] = false
          this.settings['Paths.Host'] = 'wotw.orirando.com'
          this.settings['Paths.UdpPort'] = 31415
          this.settings['Flags.UpdateToPrereleaseVersions'] = false
          this.settings['Flags.DisableDebugControls'] = true
          this.settings['Flags.Insecure'] = false
        })
      },
      hostChanged() {
        this.$nextTick(() => {
          switch (this.settings['Paths.Host']) {
            case 'wotw.orirando.com':
              this.settings['Paths.UdpPort'] = '31415'
              break
            case 'dev.wotw.orirando.com':
              this.settings['Paths.UdpPort'] = '31416'
              break
            case '127.0.0.1:8081':
              this.settings['Paths.UdpPort'] = '52423'
              break
          }
        })
      },
      getBaseName(path) {
        return path?.match(/[\\/]([^\\/]*)$/)[1]
      },
      async selectSteamPath() {
        const newPath = await window.electronApi.invoke('settings.selectSteamPath')
        if (newPath) {
          this.settings['Paths.Steam'] = newPath
        }
      },
      async selectGameBinaryPath() {
        const newPath = await window.electronApi.invoke('settings.selectGameBinaryPath')
        if (newPath) {
          this.settings['Paths.GameBinary'] = newPath
        }
      },
      onKeyUp(event) {
        if (event.key === 'Control') {
          this.ctrlPressed = false
        }
      },
      onKeyDown(event) {
        if (this.settings !== null && !this.settings['Flags.Dev']) {
          if (event.key === 'Control') {
            if (!this.ctrlPressed) {
              this.ctrlPressed = true
              this.debugStreak++
            }
          } else {
            this.debugStreak = 0
          }

          if (this.debugStreak === 5) {
            this.enableDevTools()
          }
        }
      },
      async resetLocalTrackerPosition() {
        await window.electronApi.invoke('localTracker.resetWindowRect')

        this.localTrackerPositionReset = true

        setTimeout(() => {
          this.localTrackerPositionReset = false
        }, 2000)
      },
      async downloadAndInstallUpdate() {
        await Promise.all([
          this.$router.push({ path: '/electron' }),
          await this.$store.dispatch('electron/downloadAndInstallUpdate'),
        ])
      },
    },
  }
</script>

<style lang="scss" scoped>
  .filepath-warning {
    color: #ffb32f;
    font-weight: bold;
  }
</style>
