<template>
  <v-container>
    <div class='text-center'>

      <div class="mobile-scale">
        <h1 class='mt-12'>Ori and the Will of the Wisps</h1>
        <h1 class='mb-16 randomizer'>Randomizer</h1>
      </div>

      <div class='mb-12'>
        <div class='text-left d-inline-block max-900'>
          Welcome to the Ori and the Will of the Wisps Randomizer!<br>
          This is a mod for the PC version of Ori and the Will of the Wisps
          which changes the contents of pickups. So when playing the randomizer
          you will probably find skills when picking up a spirit light container!
          This mod greatly improves the replayability of the game and is playable by
          anyone who already finished the game once. For more advanced players,
          harder difficulties will ask you to progress by using more advanced movement options or glitches.
        </div>
      </div>

      <div class='mb-4 d-flex flex-wrap gapped justify-center'>
        <v-btn color='accent' x-large :loading='!latestRandoExeUrl' :href='latestRandoExeUrl'>
          <v-icon left>mdi-download</v-icon>
          Download
        </v-btn>
        <v-btn outlined x-large text to='/seedgen'>
          <v-icon left>mdi-dice-multiple</v-icon>
          Generate a seed
        </v-btn>
        <wotw-new-game-menu x-large outlined />
        <v-btn x-large outlined text href='https://wiki.orirando.com'>
          <v-icon left>mdi-book-outline</v-icon>
          Wiki
        </v-btn>
      </div>
    </div>
  </v-container>
</template>

<script>
  import { mapGetters } from 'vuex'

  export default {
    name: 'Index',
    data: () => ({
        latestRandoExeUrl: '',
    }),
    computed: {
      ...mapGetters('version', ['latestAvailableReleaseExe']),
    },
    async mounted(){
      await this.$store.dispatch('version/updateAvailableReleases')
      this.latestRandoExeUrl = this.latestAvailableReleaseExe?.browser_download_url
    },
  }
</script>

<style lang='scss' scoped>
  @media (max-width: 768px) {
    .mobile-scale {
      font-size: 0.75em;
    }
  }

  @media (max-width: 400px) {
    .mobile-scale {
      font-size: 0.6em;
    }
  }

  h1 {
    filter: brightness(85%)
  }

  h1.randomizer {
    margin-top: -0.2em;
    font-size: 5em;
  }

  .hover-transparency {
    opacity: 0.5;
    transition: opacity 200ms;

    &:hover {
      opacity: 1;
    }
  }

  .gapped {
    gap: 0.4em;
  }

  .max-900 {
    max-width: 900px;
  }
</style>
