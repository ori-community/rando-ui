<template>
  <div>
    <div class='text-center mb-6'>
      <v-btn color='primary' text outlined depressed :disabled='linkCopied' @click='copyLink'>
        <v-icon left>{{ linkCopied ? 'mdi-check' : 'mdi-share-outline' }}</v-icon>
        {{ linkCopied ? 'Link copied' : 'Share' }}
      </v-btn>
    </div>

    <div class='text-center'>
      <div v-if='result.multiverseId !== null' class='mb-6'>
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

        <template v-if='!hideGoToGameButton'>
          <h3 class='mb-1'>1. Join the game</h3>

          <v-btn
            :to='{
              name: "game-multiverseId",
              params: {
                multiverseId: result.multiverseId
              },
              query: {
                ...(isElectron ? {hideToolbar: true} : {})
              }
            }'
            target='_blank'
            color='primary'
            text
            outlined
          >Go to game</v-btn>
        </template>
      </div>

      <h3 class='mb-1'><template v-if='result.gameId !== null && !hideGoToGameButton'>2. </template>{{ isElectron ? 'Launch' : 'Download' }} your seed</h3>
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
  import base64url from 'base64url'
  import { isElectron } from '~/assets/lib/isElectron'

  export default {
    name: 'WotwSeedgenResultView',
    props: {
      result: {
        type: Object,
        required: true,
      },
      hideGoToGameButton: {
        type: Boolean,
        required: false,
        default: false,
      }
    },
    data: () => ({
      seedsToDisplay: [],
      linkCopied: false,
      seedLaunching: false,
    }),
    computed: {
      isElectron,
      launcherUrl() {
        if (this.result.multiverseId) {
          return `ori-rando://game/${this.result.multiverseId}?seedgenResult=${JSON.stringify(this.result)}`
        } else {
          return `ori-rando://seedgen?result=${JSON.stringify(this.result)}`
        }
      }
    },
    created() {
      if (this.result.worldList.length <= 1) {
        this.seedsToDisplay = [{
          label: isElectron() ? 'Launch seed' : 'Download seed',
          url: `${this.$axios.defaults.baseURL}/seeds/${this.result.seedId}`,
          fileName: `seed_${this.result.seedId}.wotwr`,
        }]
      } else {
        this.seedsToDisplay = []
        for (const world of this.result.worldList) {
          this.seedsToDisplay.push({
            label: world,
            url: `${this.$axios.defaults.baseURL}/seeds/${this.result.seedId}/${world}`,
            fileName: `seed_${this.result.seedId}_${world}.wotwr`,
          })
        }
      }
    },
    methods: {
      async downloadSeed(seed) {
        if (isElectron()) {
          this.seedLaunching = true
          try {
            await window.electronApi.invoke('launcher.launchSeedFromUrl', seed)
          } catch (e) {
            console.error(e)
          }
          this.seedLaunching = false
        } else {
          saveAs(seed.url, seed.fileName)
        }
      },
      async copyLink() {
        const url = new URL(process.env.API_BASE_URL)

        if (this.result.multiverseId) {
          url.pathname = `/game/${this.result.multiverseId}`
          url.searchParams.append('seedgenResult', base64url.encode(JSON.stringify(this.result)))
        } else {
          url.pathname = '/seedgen'
          url.searchParams.append('result', base64url.encode(JSON.stringify(this.result)))
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
