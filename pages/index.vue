<template>
  <v-container>
    <div class="background-video-wrapper">
      <video class="background-video" muted autoplay playsinline loop src="/background.mp4" />
      <div class="overlay"></div>
    </div>

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
          <div class="text-center mt-6">
            <img class="ori-hype" src="@/assets/images/ori_hype.png" alt="oriHype" />
          </div>
        </div>
      </div>

      <div class="mb-4 d-flex flex-wrap gapped justify-center">
        <v-menu offset-y>
          <template #activator='{on, attrs}'>
            <v-btn color="accent" x-large :loading="!latestRandoWindowsUrl || !latestRandoLinuxUrl" v-bind='attrs' v-on='on'>
              <v-icon left>mdi-download</v-icon>
              Download
            </v-btn>
          </template>
          <v-list>
            <v-list-item :disabled="!latestRandoWindowsUrl" :href="latestRandoWindowsUrl">
              <v-icon left>$si-windows</v-icon>
              Windows Installer (.exe)
            </v-list-item>
            <v-list-item :disabled="!latestRandoLinuxUrl" :href="latestRandoLinuxUrl">
              <v-icon left>$si-linux</v-icon>
              Linux Package (.tar.gz)
            </v-list-item>
          </v-list>
        </v-menu>
        <v-btn outlined x-large text to="/seedgen">
          <v-icon left>mdi-dice-multiple</v-icon>
          Generate a seed
        </v-btn>
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
    components: {},
    computed: {
      ...mapGetters('version', ['latestAvailableReleaseWindowsDownload', 'latestAvailableReleaseLinuxDownload']),
      latestRandoWindowsUrl() {
        return this.latestAvailableReleaseWindowsDownload?.browser_download_url
      },
      latestRandoLinuxUrl() {
        return this.latestAvailableReleaseLinuxDownload?.browser_download_url
      },
    },
    async mounted() {
      await this.$store.dispatch('version/updateAvailableReleases')
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

  .ori-hype {
    max-width: 50px;
  }

  .gapped {
    gap: 0.4em;
  }

  .max-900 {
    max-width: 900px;
  }

  .background-video-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: -10;

    .background-video {
      width: 100%;
      height: 100%;
      mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 100%);
    }

    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
  }
</style>
