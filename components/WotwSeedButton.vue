<template>
  <v-btn :loading='loading' icon text outlined @click='downloadSeed'>
    <v-icon>{{ isElectron ? 'mdi-play' : 'mdi-download' }}</v-icon>
  </v-btn>
</template>

<script>
  import { saveAs } from 'file-saver'
  import { isElectron } from '~/assets/lib/isElectron'

  export default {
    name: 'WotwSeedButton',
    props: {
      seed: {
        type: Object,
        required: true,
      },
      seedFile: {
        type: String,
        required: true,
      },
    },
    data: () => ({
      loading: false,
    }),
    computed: {
      isElectron: () => isElectron(),
    },
    methods: {
      async downloadSeed() {
        const url = `${this.$axios.defaults.baseURL}/seeds/${this.seed.id}/files/${this.seedFile}`
        const fileName = this.seedFile + '.wotwr'

        if (isElectron()) {
          this.loading = true

          try {
            await window.electronApi.invoke('launcher.downloadSeedFromUrl', {
              url,
              fileName,
            })
            await this.$store.dispatch('electron/launch')
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
