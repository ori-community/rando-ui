<template>
  <v-row v-if='settings !== null'>
    <v-col cols='12' md='6'>
      <div class='mb-8'>
        <h3>Cutscenes</h3>
        <v-checkbox
          v-model='settings.Flags.ShowShortCutscenes'
          label='Restore Short Cutscenes'
          messages='Enables the short-but-unskippable cutscenes normally removed by the randomizer.'
        />
        <v-checkbox
          v-model='settings.Flags.ShowLongCutscenes'
          label='Restore Long Cutscenes'
          messages='Enables the long, unskippable cutscenes normally removed by the randomizer.'
        />
      </div>
      <div class='mb-8'>
        <h3>Map</h3>
        <v-checkbox
          v-model='settings.Flags.HideQuestFilter'
          label='Hide Quest Filter'
          messages='Never show the Quests filter in the in-game map'
        />
        <v-checkbox
          v-model='settings.Flags.HideWarpFilter'
          label='Hide Warp Filter'
          messages='Never show the Warp filter in the in-game map'
        />
        <v-checkbox
          v-model='settings.Flags.HideCollectableFilter'
          label='Hide Collectibles Filter'
          messages='Never show the Collectables filter in the in-game map'
        />
        <v-checkbox
          v-model='settings.Flags.AlwaysShowWarps'
          label='Always Show Warps'
          messages='Always show Spirit Wells on the in-game map, no matter what filter'
        />
        <v-checkbox
          v-model='settings.Flags.AlwaysShowKeystones'
          label='Always Show Keystones'
          messages='Always show Keystones on the in-game map, no matter what filter'
        />
        <v-checkbox
          v-model='settings.Flags.WorldMapEnabled'
          label='Enable World Map'
          messages='Enable the World Overview Map (the one when you zoom the map out far)'
        />
        <v-checkbox
          v-model='settings.Flags.DisableQuestFocus'
          label='Disable Quest Focus'
          messages="Don't focus quests when hovering the quest list"
        />
      </div>
      <div class='mb-8'>
        <h3>Miscellaneous</h3>
        <v-checkbox
          v-model='settings.Flags.BoringMoney'
          label='Boring Money'
          messages='Be classy and call Ori Money by its real name'
        />
      </div>
    </v-col>
    <v-col cols='12' md='6'>
      <div class='mb-8'>
        <h3>General Controls</h3>
        <v-checkbox
          v-model='settings.Flags.GrappleMouseControl'
          label='Grapple'
          messages='Enables aiming Grapple with your mouse cursor'
        />
        <v-checkbox
          v-model='settings.Flags.BurrowMouseControl'
          label='Burrow'
          messages='Enables aiming Burrow with your mouse cursor'
        />
        <v-checkbox
          v-model='settings.Flags.WaterDashMouseControl'
          label='Water Dash'
          messages='Enables aiming Water Dash with your mouse cursor'
        />
        <v-checkbox
          v-model='settings.Flags.InvertSwim'
          label='Invert swim speeds'
          messages='Swim fast by default, hold the Jump button to swim slower'
        />
      </div>
      <div class='mb-8'>
        <h3>Launch settings</h3>

        <v-text-field
          v-model='settings.Paths.Steam'
          readonly
          label='Steam path'
          append-icon='mdi-folder-search-outline'
          @click:append='selectSteamPath'
        />

        <v-checkbox
          v-model='settings.Flags.LaunchWithTracker'
          label='Launch with Item Tracker'
          messages='Automatically open the item tracker when launching the randomizer'
        />
        <v-checkbox
          v-model='settings.Flags.DisableNetcode'
          label='Disable Netcode'
          messages='Checking this option prevents the randomizer from communicating with the rando server.`nWith netcode disabled, bingo autotracking and other networked features will be unavailable.'
        />
        <v-checkbox
          v-model='settings.Flags.UseWinStore'
          label='Use Windows Store'
          messages='Launch the rando using the windows store version of the game.'
        />
      </div>
      <div v-if='settings.Flags.Dev' class='mb-8'>
        <h3>Developer Tools</h3>
        <v-checkbox
          v-model='settings.Flags.Dev'
          label='Enable Developer Tools'
          messages='Welcome to the world of fun'
        />
        <v-checkbox
          v-model='settings.Flags.WaitForDebugger'
          label='Wait for Debugger'
          messages='The Randomizer will wait for a debugger to attach before initialization'
        />
        <v-text-field
          v-model='settings.Paths.URL'
          label='Server URL'
          class='mt-4'
        />
        <v-text-field
          v-model='settings.Paths.UdpPort'
          label='UDP Port'
        />
      </div>
    </v-col>
  </v-row>
</template>

<script>
  export default {
    data: () => ({
      settings: null,
      debugStreak: 0,
    }),
    head() {
      return {
        title: 'WotwRandoSettings',
      }
    },
    watch: {
      settings: {
        deep: true,
        async handler(settings) {
          await window.electronApi.invoke('settings.setSettings', settings)
          await window.electronApi.invoke('settings.writeSettings')
        }
      }
    },
    async mounted() {
      this.settings = await window.electronApi.invoke('settings.readSettings')
      document.addEventListener('keydown', this.onKeyDown)
    },
    beforeDestroy() {
      document.removeEventListener('keydown', this.onKeyDown)
    },
    methods: {
      async selectSteamPath() {
        const newPath = await window.electronApi.invoke('settings.selectSteamPath')
        if (newPath) {
          this.settings.Paths.Steam = newPath
        }
      },
      onKeyDown(event) {
        if (this.settings !== null && !this.settings.Flags.Dev) {
          event.key === 'Control' ? this.debugStreak++ : this.debugStreak = 0;
          if (this.debugStreak === 5) {
            this.settings.Flags.Dev = true
            this.debugStreak = 0
          }
        }
      }
    }
  }
</script>
