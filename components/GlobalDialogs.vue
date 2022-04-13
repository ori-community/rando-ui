<template>
  <div>
    <v-dialog :value='currentSupportBundleName !== null' max-width='600' persistent>
      <v-card>
        <div class='pa-6'>
          <h1 class='text-center'>Uh oh!</h1>
          <h3 class='text-center mb-4'>Something went oribly wrong</h3>

          <div>
            It seems like the game crashed... We collected some information and important files that would help us
            to find the issue. Please reach out to one of the developers on our Discord and send them the file.
          </div>

          <div class='text-center my-8'>
            <code class='title'>{{ currentSupportBundleName }}</code>
          </div>

          <div class='d-flex justify-end'>
            <v-btn text depressed @click='currentSupportBundleName = null'>
              Close
            </v-btn>
            <v-btn depressed color='accent' class='ml-2' @click='showSupportBundleInExplorer'>
              Show in Explorer
            </v-btn>
          </div>
        </div>
        <img class='crash-ori' src='~/assets/images/ori_sus.png' alt=''>
      </v-card>
    </v-dialog>

    <v-dialog v-model='showUpdateAvailableDialog' max-width='500' persistent>
      <v-card>
        <v-card-title>Update available ({{ latestVisibleVersion }})</v-card-title>
        <v-card-text>
          An update for the randomizer is ready to be downloaded and installed.
          We recommend to always play on the latest version.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text class='mr-1' @click='forceLaunch'>
            Launch anyway
          </v-btn>
          <v-btn depressed color='accent' @click='downloadAndInstallUpdate'>
            Install update
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'

  export default {
    name: 'GlobalDialogs',
    computed: {
      ...mapGetters('version', [
        'latestVisibleVersion',
      ]),
      currentSupportBundleName: {
        set(value) {
          this.$store.commit('electron/setCurrentSupportBundleName', value)
        },
        get() {
          return this.$store.state.electron.currentSupportBundleName
        },
      },
      showUpdateAvailableDialog: {
        set(value) {
          this.$store.commit('electron/setShowUpdateAvailableDialog', value)
        },
        get() {
          return this.$store.state.electron.showUpdateAvailableDialog
        },
      }
    },
    methods: {
      async downloadAndInstallUpdate() {
        await this.$store.dispatch('electron/downloadAndInstallUpdate')
      },
      async forceLaunch() {
        await this.$store.dispatch('electron/launch', {
          forceLaunch: true,
        })
      },
      showSupportBundleInExplorer() {
        window.electronApi.invoke('crash.showSupportBundleInExplorer', this.currentSupportBundleName)
      },
    }
  }
</script>

<style lang='scss' scoped>
  .crash-ori {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 96px;
    transform: scaleX(-1);
  }
</style>
