<template>
  <v-container>
    <h1 class='text-center mt-12 mb-6'>Settings</h1>

    <v-scroll-y-transition>
      <v-card v-show='settingsLoaded'>
        <v-tabs>
          <v-tab>General</v-tab>
          <v-tab>Controller</v-tab>
          <v-tab>Keyboard</v-tab>
          <v-tab>System</v-tab>

          <v-tab-item class='pa-5'>
            <wotw-rando-settings />
          </v-tab-item>
          <v-tab-item class='pa-5'>
            <wotw-rebind-settings type='controller' />
          </v-tab-item>
          <v-tab-item class='pa-5'>
            <wotw-rebind-settings type='kbm' />
          </v-tab-item>
          <v-tab-item v-if='isWindows' class='pa-5'>
            <p>
              Sometimes, the Randomizer gets detected by Antivirus software because we inject
              additional code into the game. You can add an exception for Windows Defender here.
              If you are using another Antivirus and it blocks the randomizer, you'll have to
              add an exception manually.
            </p>
            <v-btn large depressed color='accent' class='mt-3' :loading='addExceptionForWindowsDefenderLoading' @click='addExceptionForWindowsDefender'>
              Add Exception for Windows Defender
            </v-btn>
          </v-tab-item>
        </v-tabs>
      </v-card>
    </v-scroll-y-transition>
  </v-container>
</template>

<script>
  import { mapState } from 'vuex'
  import { EventBus } from '~/assets/lib/EventBus'
  import { isOS, Platform } from '~/assets/lib/os'

  export default {
    name: 'Settings',
    data: () => ({
      addExceptionForWindowsDefenderLoading: false,
    }),
    computed: {
      isWindows: isOS(Platform.Windows),
      ...mapState('electron', ['settingsLoaded']),
    },
    methods: {
      async addExceptionForWindowsDefender() {
        this.addExceptionForWindowsDefenderLoading = true

        try {
          await window.electronApi.invoke('launcher.addExceptionForWindowsDefender')
        } catch (e) {
          console.error(e)
          EventBus.$emit('main.error', e)
        }

        this.addExceptionForWindowsDefenderLoading = false
      }
    }
  }
</script>

<style scoped>

</style>
