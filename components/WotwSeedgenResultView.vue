<template>
  <v-card class='pa-6'>
    <div class='text-center mb-6'>
      <v-btn color='accent' depressed :disabled='linkCopied' @click='copyLink'>
        <v-icon left>{{ linkCopied ? 'mdi-check' : 'mdi-share-outline' }}</v-icon>
        {{ linkCopied ? 'Link copied' : 'Share' }}
      </v-btn>
    </div>

    <div v-if='result.gameId !== null' class='mt-6'>
      <h3>1. Join the game</h3>

      <v-btn :href='`/game/${result.gameId}`' target='_blank' color='primary' text outlined>Go to game</v-btn>
    </div>

    <h3><template v-if='result.gameId !== null'>2. </template>Download your seed</h3>
    <div>
      <v-btn v-for='seed in seedsToDisplay' :key='seed.url' color='primary' text outlined class='mb-1 mr-1' @click='downloadSeed(seed)'>
        <v-icon left>mdi-download-outline</v-icon>
        {{ seed.label }}
      </v-btn>
    </div>
  </v-card>
</template>

<script>
  import { saveAs } from 'file-saver'

  export default {
    name: 'WotwSeedgenResultView',
    props: {
      result: {
        type: Object,
        required: true,
      }
    },
    data: () => ({
      seedsToDisplay: [],
      linkCopied: false,
    }),
    created() {
      if (this.result.playerList.length < 2) {
        this.seedsToDisplay = [{
          label: 'Download seed',
          url: `${this.$axios.defaults.baseURL}/seeds/${this.result.seedId}`,
          fileName: `seed_${this.result.seedId}.wotwr`,
        }]
      } else {
        this.seedsToDisplay = []
        for (const player of this.result.playerList) {
          this.seedsToDisplay.push({
            label: player,
            url: `${this.$axios.defaults.baseURL}/seeds/${this.result.seedId}/${player}`,
            fileName: `seed_${this.result.seedId}_${player}.wotwr`,
          })
        }
      }
    },
    methods: {
      downloadSeed(seed) {
        saveAs(seed.url, seed.fileName)
      },
      async copyLink() {
        await navigator.clipboard.writeText(window.location.href)
        this.linkCopied = true

        setTimeout(() => {
          this.linkCopied = false
        }, 3000)
      }
    }
  }
</script>

<style scoped>

</style>
