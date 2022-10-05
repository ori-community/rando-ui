<template>
  <v-tooltip open-delay="500" top :disabled="!isElectron">
    <template #activator="{on, attrs}">
      <v-btn v-bind="attrs" :loading='loading' icon text outlined @click='launchOrDownloadSeed' v-on="on">
        <v-icon>{{ (isElectron && !forceDownload) ? 'mdi-play' : 'mdi-download' }}</v-icon>
      </v-btn>
    </template>
    <span>Hold <kbd>Ctrl</kbd> to download</span>
  </v-tooltip>
</template>

<script>
  import { saveAs } from 'file-saver'
  import { isElectron } from '~/assets/lib/isElectron'
  import {holdControl} from '~/assets/lib/holdControl'

  export default {
    name: 'WotwSeedButton',
    mixins: [holdControl('forceDownload')],
    props: {
      seedId: {
        type: [String, Number],
        required: true,
      },
    },
    data: () => ({
      loading: false,
      forceDownload: false,
    }),
    computed: {
      isElectron: () => isElectron(),
    },
    methods: {
      async launchOrDownloadSeed() {
        const url = `${this.$axios.defaults.baseURL}/world-seeds/${this.seedId}/file`
        const fileName = `${this.seedId}.wotwr`

        if (isElectron()) {
          this.loading = true

          const forceDownload = this.forceDownload

          try {
            await window.electronApi.invoke('launcher.downloadSeedFromUrl', {
              url,
              fileName,
              setToCurrent: !forceDownload,
              showInExplorer: forceDownload,
            })

            if (!forceDownload) {
              await this.$store.dispatch('electron/launch')
            }
          } catch (e) {
            console.error(e)
          }

          this.loading = false
        } else {
          saveAs(url, fileName)
        }
      },
    },
  }
</script>

<style scoped>

</style>
