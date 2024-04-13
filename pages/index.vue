<template>
  <v-container>
    <div class="text-center">
      <div class="mobile-scale">
        <h1 class="mt-12">Ori and the Will of the Wisps</h1>
        <h1 class="mb-16 main-title">Randomizer</h1>
      </div>

      <div class="mb-10">
        <div class="text-left d-inline-block max-900">
          <div>
            Welcome to the Ori and the Will of the Wisps Randomizer!<br />
            This is a mod for the PC version of Ori and the Will of the Wisps. It shuffles the location of items and
            adds more features to the original game. It even allows you to play with your friends in multiplayer
            sessions! This mod greatly improves the replayability of the game and is playable by anyone who has already
            finished the game once. For more advanced players, harder difficulties will ask you to progress by using
            more advanced movement options or glitches.
          </div>
          <div class="mt-4">
            This mod works for Windows and Linux. It supports the game from Steam and Microsoft Store. If you need help
            getting started you can find information in the <a href="https://wiki.orirando.com">wiki</a> or on the
            <a href="https://discord.com/invite/sfUr8ra5P7">Development Discord</a>. We'll be glad to help.<br />
            On the <a href="https://discord.com/invite/SUS57PWWnA">Speedrunning Discord</a> you can also find other Ori
            rando enjoyers to play with or against.
          </div>
          <div class="text-center mt-6 text-join">Join the oriHype!</div>
        </div>
      </div>

      <div class="mb-4 d-flex flex-wrap gapped justify-center">
        <v-btn color="accent" x-large :loading="!latestRandoExeUrl" :href="latestRandoExeUrl">
          <v-icon left>mdi-download</v-icon>
          Download
        </v-btn>
        <v-btn outlined x-large text to="/seedgen">
          <v-icon left>mdi-dice-multiple</v-icon>
          Generate a seed
        </v-btn>
        <wotw-new-game-menu x-large outlined />
        <v-btn x-large outlined text href="https://wiki.orirando.com">
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
    async mounted() {
      await this.$store.dispatch('version/updateAvailableReleases')
      this.latestRandoExeUrl = this.latestAvailableReleaseExe?.browser_download_url
    },
  }
</script>

<style lang="scss" scoped>
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
    filter: brightness(85%);
  }

  h1.main-title {
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

  .text-join {
    font-size: 1.2em;
  }
  .gapped {
    gap: 0.4em;
  }

  .max-900 {
    max-width: 900px;
  }
</style>
