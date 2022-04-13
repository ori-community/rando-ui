<template>
  <v-container style='max-width:900px'>
    <div class='text-center'>

      <h1 class='mt-12 mb-4'>Ori and the Will of the Wisps</h1>
      <h1 class='mb-16 randomizer'>Randomizer</h1>

      <div class='mb-12'>
        <div class='text-left d-inline-block'>
          Welcome to the Ori and the Will of the Wisps Randomizer!<br>
          This is a mod for the PC version of Ori and the Will of the Wisps
          which changes the contents of pickups. So when playing the randomizer
          you will probably find skills when picking up a spirit light container!
          This mod greatly improves the replayability of the game and is playable by
          anyone who already finished the game once. For more advanced players,
          harder difficulties will ask you to progress by using more advanced movement options or glitches.
        </div>
      </div>

      <div class='mb-4 d-flex gapped justify-center'>
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
  h1 {
    filter: brightness(85%)
  }

  h1.randomizer {
    transform: scale(2.5);
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
</style>
