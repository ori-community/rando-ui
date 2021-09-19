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
      </div>
    </v-col>
    <v-col cols='12' md='6'>
      <div class='mb-8'>
        <h3>Mouse Aiming</h3>
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
      </div>
      <div class='mb-8'>
        <h3>Launch settings</h3>
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
    </v-col>
  </v-row>
</template>

<script>
  export default {
    data: () => ({
      settings: null,
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
    },
  }
</script>
