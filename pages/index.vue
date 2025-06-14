<template>
  <v-container>
    <div class="background-video-wrapper">
      <video class="background-video" muted autoplay playsinline loop src="/background.mp4" />
      <div class="overlay"></div>
    </div>

    <div class="text-center">
      <div class="d-inline-block" :class="showText ? `dark-background` : ``">
        <div :class="!showText ? `hide-text` : ``">
          <div class="mobile-scale">
            <h1 class="mt-12">Ori and the Will of the Wisps</h1>
            <h1 class="mb-16 main-title">Randomizer</h1>
          </div>

          <div class="mb-10">
            <div class="text-left max-900">
              <div>
                Welcome to the Ori and the Will of the Wisps Randomizer!<br />
                This is a mod for the PC version of Ori and the Will of the Wisps. It shuffles the location of items and
                adds more features to the original game. It even allows you to play with your friends in multiplayer
                sessions! This mod greatly improves the replayability of the game and is playable by anyone who has
                already finished the game once. For more advanced players, harder difficulties will ask you to progress
                by using more advanced movement options or glitches.
              </div>
              <div class="mt-4">
                This mod works for Windows and Linux. It supports the game from Steam and Microsoft Store. If you need
                help getting started you can find information in the <a href="https://wiki.orirando.com">wiki</a> or on
                the <a href="https://discord.com/invite/sfUr8ra5P7">Development Discord</a>. We'll be glad to help.<br />
                On the <a href="https://discord.com/invite/SUS57PWWnA">Speedrunning Discord</a> you can also find other
                Ori rando enjoyers to play with or against.
              </div>
              <div ref="oriHype" class="d-flex justify-center align-center flex gapped mt-6">
                <div class="text-join">Join the oriHype!</div>
                <img class="ori-hype" src="@/assets/images/ori_hype.png" alt="oriHype" />
              </div>
            </div>
          </div>
        </div>

        <div class="mb-4 d-flex flex-wrap gapped justify-center">
          <v-menu offset-y>
            <template #activator="{ on, attrs }">
              <div style="position: relative" v-on="on">
                <div class="ori-lurk-container">
                  <img class="ori-lurk" :class="{ lurking: buttonLurking }" src="@/assets/images/ori_lurk.png" />
                </div>
                <v-btn color="accent" x-large :loading="!latestRandoWindowsUrl || !latestRandoLinuxUrl" v-bind="attrs">
                  <v-icon left>mdi-download</v-icon>
                  Download
                </v-btn>
              </div>
            </template>
            <v-list>
              <v-list-item :disabled="!latestRandoWindowsUrl" @click="downloadRando(latestRandoWindowsUrl)">
                <v-icon left>$si-windows</v-icon>
                Windows Installer (.exe)
              </v-list-item>
              <v-list-item :disabled="!latestRandoLinuxUrl" @click="downloadRando(latestRandoLinuxUrl)">
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
          <v-btn icon x-large text @click="showText = !showText">
            <v-icon v-if="showText">mdi-eye-off-outline</v-icon>
            <v-icon v-else>mdi-eye-outline</v-icon>
          </v-btn>
        </div>
      </div>
    </div>
  </v-container>
</template>

<script>
  import { mapGetters } from 'vuex'
  import { confettiFromElement } from '~/assets/lib/confettiFromElement'

  export default {
    name: 'Index',
    components: {},
    data: () => ({
      lurkTimeoutId: null,
      buttonLurking: false,
      showText: true,
    }),
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
      this.lurkAfterRandomTime()
      await this.$store.dispatch('version/updateAvailableReleases')
    },
    methods: {
      lurkAfterRandomTime() {
        this.lurkTimeoutId = setTimeout(() => {
          this.buttonLurking = !this.buttonLurking

          this.lurkAfterRandomTime()
        }, 2000 + Math.random() * 10000)
      },
      downloadRando(url) {
        window.open(url, '_self')
        confettiFromElement(this.$refs.oriHype, {
          disableForReducedMotion: true,
          zIndex: 100000,
        })
      },
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
    font-size: 1.3em;
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

  .ori-lurk-container {
    display: block;
    position: absolute;
    pointer-events: none;
    top: -3rem;
    left: 0;
    right: 0;
    bottom: 100%;
    overflow: hidden;
  }

  .ori-lurk {
    margin: 0 auto;
    left: 50%;
    height: 3rem;
    position: absolute;
    transform: translateY(100%) translateX(-50%) scale(0.9);
    transition: transform 300ms;

    &.lurking {
      transform: translateY(5%) translateX(-50%);
    }
  }

  .dark-background {
    background-color: rgba(0, 0, 0, 0.6);
    border-radius: 10em;
    box-shadow: 0 0 3em 3em rgba(0, 0, 0, 0.6);
  }

  .hide-text {
    visibility: hidden;
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
