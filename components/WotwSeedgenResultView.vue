<!-- TODO: Rewrite this -->

<template>
  <div>
    <div class='text-center mb-6'>
      <v-btn color='primary' text outlined depressed :disabled='linkCopied' @click='copyLink'>
        <v-icon left>{{ linkCopied ? 'mdi-check' : 'mdi-share-outline' }}</v-icon>
        {{ linkCopied ? 'Link copied' : 'Share' }}
      </v-btn>
    </div>

    <div class='text-center'>
      <div v-if='multiverseId !== null' class='mb-6'>
        <template v-if='!isElectron'>
          <v-btn
            :href='launcherUrl'
            color='accent'
            block
            x-large
            class='my-5'
          >
            <v-icon left>mdi-launch</v-icon>
            Open in Launcher
          </v-btn>

          <v-sheet height='1' color='background lighten-2' class='separator my-12'>
            <v-sheet color='background lighten-1' class='text px-2'>
              or
            </v-sheet>
          </v-sheet>
        </template>
      </div>

      <h3 class='mb-1'>{{ isElectron ? 'Launch' : 'Download' }} your seed</h3>
      <div>
        <v-btn
          v-for='seed in seedsToDisplay'
          :key='seed.url'
          :disabled='seedLaunching'
          color='primary'
          text
          outlined
          class='mb-1 mr-1'
          @click='downloadSeed(seed)'
        >
          <v-icon left>{{ isElectron ? 'mdi-play-outline' : 'mdi-download-outline' }}</v-icon>
          {{ seed.label }}
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
  import { saveAs } from 'file-saver'
  import { isElectron } from '~/assets/lib/isElectron'

  export default {
    name: 'WotwSeedgenResultView',
    props: {
      result: {
        type: Object,
        required: true,
      },
      multiverseId: {
        type: Number,
        required: false,
        default: null,
      },
    },
    data: () => ({
      seedsToDisplay: [],
      linkCopied: false,
      seedLaunching: false,
    }),
    computed: {
      isElectron,
      launcherUrl() {
        if (this.multiverseId) {
          return `ori-rando://game/${this.multiverseId}`
        } else {
          return `ori-rando://seedgen?seedGroupId=${this.result.seedGroupId}`
        }
      }
    },
    created() {
      if (this.result.files.length <= 1) {
        this.seedsToDisplay = [{
          label: isElectron() ? 'Launch seed' : 'Download seed',
          url: `${this.$axios.defaults.baseURL}/seeds/${this.result.seedIds[0]}/file`,
          fileName: `seed_${this.result.id}.wotwr`,
        }]
      } else {
        this.seedsToDisplay = []
        for (const seedId of this.result.seedIds) {
          this.seedsToDisplay.push({
            label: seedId,
            url: `${this.$axios.defaults.baseURL}/seeds/${seedId}/file`,
            fileName: `seed_${this.result.seedGroupId}_${seedId}.wotwr`,
          })
        }
      }
    },
    mounted() {
      if (!isElectron() && this.launcherUrl) {
        window.location.href = this.launcherUrl
      }
    },
    methods: {
      async downloadSeed(seed) {
        if (isElectron()) {
          this.seedLaunching = true
          try {
            await window.electronApi.invoke('launcher.downloadSeedFromUrl', seed)
            await this.$store.dispatch('electron/launch')
          } catch (e) {
            console.error(e)
          }
          this.seedLaunching = false
        } else {
          saveAs(seed.url, seed.fileName)
        }
      },
      async copyLink() {
        const url = new URL(this.$axios.defaults.baseURL)

        if (this.multiverseId) {
          url.pathname = `/game/${this.multiverseId}`
        } else {
          url.pathname = '/seedgen'
          url.searchParams.append('seedId', this.result.id)
        }
        await navigator.clipboard.writeText(url.toString())
        this.linkCopied = true

        setTimeout(() => {
          this.linkCopied = false
        }, 3000)
      }
    }
  }
</script>

<style lang='scss' scoped>
  .separator {
    display: flex;
    justify-content: center;
    overflow: visible;
    height: 1px;

    .text {
      display: inline-block;
      position: absolute;
      transform: translateY(-50%);
    }
  }
</style>
