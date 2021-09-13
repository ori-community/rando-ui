<template>
  <v-row v-if='settings !== null'>
    <v-col cols='12' md='6'>
      <v-card class='pa-5 mb-6'>
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
      </v-card>
      <v-card class='pa-5 mb-6'>
        <h3>Map</h3>
        <v-checkbox
          label='Hide Quest Filter'
          messages='Never show the Quests filter in the in-game map'
        />
        <v-checkbox
          label='Hide Warp Filter'
          messages='Never show the Warp filter in the in-game map'
        />
        <v-checkbox
          label='Hide Collectibles Filter'
          messages='Never show the Collectables filter in the in-game map'
        />
        <v-checkbox
          label='Always Show Warps'
          messages='Always show Spirit Wells on the in-game map, no matter what filter'
        />
      </v-card>
    </v-col>
    <v-col cols='12' md='6'>
      <v-card class='pa-5 mb-6'>
        <h3>Mouse Aiming</h3>
        <v-checkbox
          label='Grapple'
          messages='Enables aiming Grapple with your mouse cursor'
        />
        <v-checkbox
          label='Burrow'
          messages='Enables aiming Burrow with your mouse cursor'
        />
        <v-checkbox
          label='Water Dash'
          messages='Enables aiming Water Dash with your mouse cursor'
        />
      </v-card>
      <v-card class='pa-5 mb-6'>
        <h3>Launch settings</h3>
        <v-checkbox
          label='Launch with Item Tracker'
          messages='Automatically open the item tracker when launching the randomizer'
        />
        <v-checkbox
          label='Automatic Updates'
          messages='Allows the randomizer to check for new updates on launch. Highly recommended!'
        />
        <v-checkbox
          label='Beta Versions'
          messages='Allows the randomizer to update to beta versions in need of testing. We appreciate the help!'
        />
        <v-checkbox
          label='Disable Netcode'
          messages='Checking this option prevents the randomizer from communicating with the rando server.`nWith netcode disabled, bingo autotracking and other networked features will be unavailable.'
        />
        <v-checkbox
          label='Use Windows Store'
          messages='Launch the rando using the windows store version of the game.'
        />
      </v-card>
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
