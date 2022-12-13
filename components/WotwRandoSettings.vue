<template>
  <v-row v-if='settings !== null && settingsLoaded'>
    <v-col cols='12' md='6'>
      <div class='mb-8'>
        <h3>Map</h3>
        <v-checkbox
          v-model='settings["Flags.HideQuestFilter"]'
          label='Hide Quest Filter'
          messages='Never show the Quests filter in the in-game map'
        />
        <v-checkbox
          v-model='settings["Flags.HideWarpFilter"]'
          label='Hide Warp Filter'
          messages='Never show the Warp filter in the in-game map'
        />
        <v-checkbox
          v-model='settings["Flags.HideCollectableFilter"]'
          label='Hide Collectibles Filter'
          messages='Never show the Collectables filter in the in-game map'
        />
        <v-checkbox
          v-model='settings["Flags.AlwaysShowWarps"]'
          label='Always Show Warps'
          messages='Always show Spirit Wells on the in-game map, no matter what filter'
        />
        <v-checkbox
          v-model='settings["Flags.AlwaysShowKeystoneDoors"]'
          label='Always Show Keystone Doors'
          messages='Always show Keystone Doors on the in-game map, no matter what filter'
        />
        <v-checkbox
          v-model='showTransparentIcons'
          label='Show Transparent Icons'
          messages='Show out of logic icons as transparent'
        />
        <v-checkbox
          v-model='disableWorldMap'
          label='Disable World Map'
          messages='Disables the world map that opens when zooming out'
        />
      </div>
      <div class='mb-8'>
        <h3>Miscellaneous</h3>
        <v-checkbox
          v-model='settings["Flags.ShowStatsAfterFinish"]'
          label='Show Stats after Finish'
          messages='Show stats in the launcher after finishing a game'
        />
        <v-checkbox
          v-model='useRandomCurrencyNames'
          label='Random Currency Names'
          messages='Bored of seeing "X Spirit Light"? This setting is for you!'
        />
        <v-checkbox
          v-model='settings["Flags.AlwaysShowKeystones"]'
          label='Always Show Keystones'
          messages='Keep your keystone count visible while playing'
        />
        <v-checkbox
          v-model='settings["Flags.SelectInLogicFilterByDefault"]'
          label='Start with In Logic filter'
          messages='Select the In Logic map filter by default instead of the All filter'
        />
        <v-checkbox
          v-model='settings["Flags.DisableShowSecrets"]'
          label='Disable always showing secret areas'
          messages='By default, the randomizer shows all secrets without having the Sense Shard equipped'
        />
        <v-slider
          v-model='settings["Values.CameraShakeIntensity"]'
          class='mt-3'
          min='0'
          max='2'
          step='0.1'
          ticks
          thumb-label
          label='Camera Shake Intensity'
          messages='Sets the intensity of camera shakes in the game'
        />
      </div>
      <div class='mb-8'>
        <h3>Launch settings</h3>

        <v-text-field
          v-if='isWindows'
          v-model='settings["Paths.Steam"]'
          readonly
          label='Steam path'
          append-icon='mdi-folder-search-outline'
          @click:append='selectSteamPath'
        />

        <v-text-field
          v-if='isLinux'
          v-model='settings["Paths.GameBinary"]'
          readonly
          label='Game Binary path (oriwotw.exe)'
          append-icon='mdi-folder-search-outline'
          @click:append='selectGameBinaryPath'
        />

        <v-checkbox
          v-model='settings["Flags.DisableNetcode"]'
          label='Disable Netcode'
          messages='Checking this option prevents the randomizer from communicating with the rando server. With netcode disabled, bingo autotracking and other networked features will be unavailable.'
        />
        <v-checkbox
          v-model='settings["Flags.UseWinStore"]'
          label='Use Windows Store'
          messages='Launch the rando using the windows store version of the game.'
        />
      </div>
    </v-col>
    <v-col cols='12' md='6'>
      <div class='mb-8'>
        <h3>Control Options</h3>
        <v-checkbox
          v-model='settings["Flags.GrappleMouseControl"]'
          label='Grapple Mouse Aiming'
          messages='Enables aiming Grapple with your mouse cursor'
        />
        <v-checkbox
          v-model='settings["Flags.BurrowMouseControl"]'
          label='Burrow Mouse Aiming'
          messages='Enables aiming Burrow with your mouse cursor'
        />
        <v-checkbox
          v-model='settings["Flags.WaterDashMouseControl"]'
          label='Swimming Mouse Aiming'
          messages='Enable Swimming and Water Dashing towards your mouse cursor'
        />
        <v-checkbox
          v-model='settings["Flags.InvertSwim"]'
          label='Invert swim speeds'
          messages='Swim fast by default. Hold jump to swim slower instead'
        />
        <v-checkbox
          v-model='settings["Flags.CursorLock"]'
          label='Lock Cursor to Window'
          messages='Prevents the mouse cursor from moving outside the game window'
        />
        <v-checkbox
          v-model='settings["Flags.DisableAutoAim"]'
          label='Disable Autoaim'
          messages='Disables Autoaiming for Spike, Bow and Shuriken'
        />
      </div>
      <div class='mb-8'>
        <h3>Tracker</h3>

        <v-checkbox
          v-model='settings["Flags.LaunchWithTracker"]'
          label='Launch with Game'
          messages='Automatically open the item tracker when launching the randomizer'
        />

        <v-checkbox
          v-model='settings["LocalTracker.AlwaysOnTop"]'
          label='Always on top'
          messages='Show the Item Tracker on top of other windows'
        />

        <v-checkbox
          v-model='settings["LocalTracker.Transparent"]'
          label='Transparent Window'
          messages='Make the Item Tracker transparent.'
        />

        <v-checkbox
          v-model='settings["LocalTracker.IgnoreMouse"]'
          label='Ignore mouse'
          messages='This is helpful if you want to show the tracker above the game. Note that you cannot move/resize the tracker with this option enabled.'
        />

        <v-checkbox
          v-model='settings["LocalTracker.ShowWillowHearts"]'
          label='Show Willow Hearts'
          messages='Shows the amount of destroyed willow hearts.'
        />

        <v-expand-transition>
          <v-checkbox
            v-if='settings["LocalTracker.ShowWillowHearts"]'
            v-model='settings["LocalTracker.HideHeartsUntilFirstHeart"]'
            label='Hide counter until first heart is destroyed'
            messages='Only shows the amount of willow hearts when at least one heart is destroyed'
          />
        </v-expand-transition>

        <v-btn depressed color="accent" class="mt-3" :disabled="localTrackerPositionReset" @click="resetLocalTrackerPosition">
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
      <div v-if='settings["Flags.Dev"]' class='mb-8'>
        <h3>Developer Tools</h3>
        <v-checkbox
          v-model='settings["Flags.Dev"]'
          label='Enable Developer Tools'
          messages='Welcome to the world of fun'
        />
        <v-checkbox
          v-model='settings["Flags.UpdateToPrereleaseVersions"]'
          label='Update to prerelease versions'
          messages='Search for and ask to update to unreleased unstable versions'
        />
        <v-checkbox
          v-model='settings["Flags.WaitForDebugger"]'
          label='Wait for Debugger'
          messages='The Randomizer will wait for a debugger to attach before initialization'
        />
        <v-checkbox
          v-model='enableDebugControls'
          label='Enable Debug Controls'
          messages='Enable Debug Controls by default'
        />
        <v-text-field
          v-model='settings["Paths.Host"]'
          label='Server Host'
          class='mt-4'
          messages='Press Ctrl+R after changing this setting for it to apply in the launcher'
        />
        <v-text-field
          v-model='settings["Paths.UdpPort"]'
          label='UDP Port'
        />
        <v-checkbox
          v-model='useSecureConnection'
          label='Use Secure connection'
          messages='Connect to the Server using HTTPS and WSS instead of HTTP and WS'
        />
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
      useRandomCurrencyNames: {
        get() {
          return !this.settings['Flags.BoringMoney']
        },
        set(value) {
          this.settings['Flags.BoringMoney'] = !value
        }
      },
      disableWorldMap: {
        get() {
          return !this.settings['Flags.WorldMapEnabled']
        },
        set(value) {
          this.settings['Flags.WorldMapEnabled'] = !value
        }
      },
      enableDebugControls: {
        get() {
          return !this.settings['Flags.DisableDebugControls']
        },
        set(value) {
          this.settings['Flags.DisableDebugControls'] = !value
        }
      },
      showTransparentIcons: {
        get() {
          return this.settings['Values.MapIconTransparency'] > 0.0;
        },
        set(value) {
          this.settings['Values.MapIconTransparency'] = value ? 0.25 : 0.0
        }
      },
      useSecureConnection: {
        get() {
          return !this.settings['Flags.Insecure']
        },
        set(value) {
          this.settings['Flags.Insecure'] = !value
        }
      },
    },
    mounted() {
      document.addEventListener('keydown', this.onKeyDown)
    },
    beforeDestroy() {
      document.removeEventListener('keydown', this.onKeyDown)
    },
    methods: {
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
      onKeyDown(event) {
        if (this.settings !== null && !this.settings['Flags.Dev']) {
          event.key === 'Control' ? this.debugStreak++ : this.debugStreak = 0;
          if (this.debugStreak === 5) {
            this.settings['Flags.Dev'] = true
            this.debugStreak = 0
          }
        }
      },
      async resetLocalTrackerPosition() {
        this.settings.LocalTracker.X = 0
        this.settings.LocalTracker.Y = 0
        this.settings.LocalTracker.Width = 700
        this.settings.LocalTracker.Height = 405

        await window.electronApi.invoke('localTracker.resetWindowRect')

        this.localTrackerPositionReset = true

        setTimeout(() => {
          this.localTrackerPositionReset = false
        }, 2000)
      }
    }
  }
</script>
