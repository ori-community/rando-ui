<template>
  <div class="text-center">
    <div class="d-inline-block">
      <div class="mobile-scale">
        <h1 class="mt-12">Ori and the Will of the Wisps</h1>
        <h1 class="mb-16 main-title">Randomizer</h1>
      </div>

      <div class="mb-10">
        <div class="text-left max-900">
          <div>
            Welcome to the Ori and the Will of the Wisps Randomizer!<br/>
            This is a mod for the PC version of Ori and the Will of the Wisps. It shuffles the location of items and
            adds more features to the original game. It even allows you to play with your friends in multiplayer
            sessions! This mod greatly improves the replayability of the game and is playable by anyone who has
            already finished the game once. For more advanced players, harder difficulties will ask you to progress
            by using more advanced movement options or glitches.
          </div>
          <div class="mt-4">
            This mod works for Windows and Linux. It supports the game from Steam and Microsoft Store. If you need
            help getting started you can find information in the
            <a target="_blank" :href="wikiUrl">wiki</a>
            or on the
            <a target="_blank" :href="discordDevUrl">Development Discord</a>.
            We'll be glad to help.<br/>
            On the <a target="_blank" :href="discordSpeedrunUrl">Speedrunning Discord</a>
            you can also find other
            Ori rando enjoyers to play with or against.
          </div>
          <div ref="oriHype" class="d-flex justify-center align-center flex gapped mt-6">
            <div class="text-join">Join the oriHype!</div>
            <img class="ori-hype" src="@shared/images/ori_hype.png" alt="oriHype"/>
          </div>
        </div>
      </div>
    </div>

    <div class="mb-4 d-flex flex-wrap gapped justify-center">
      <!--      TODO GetLatestReleaseUrl-->
      <v-menu offset-y>
        <template #activator="{ props }">
          <div style="position: relative">
            <div class="ori-lurk-container">
              <img class="ori-lurk" :class="{ lurking: buttonLurking }" src="@shared/images/ori_lurk.png"/>
            </div>
            <v-btn
              color="accent"
              size="x-large"
              :loading="!latestRandoWindowsUrl || !latestRandoLinuxUrl"
              v-bind="props"
            >
              <v-icon start>mdi-download</v-icon>
              Download
            </v-btn>
          </div>
        </template>
        <v-list>
          <v-list-item :disabled="!latestRandoWindowsUrl" @click="downloadRando(latestRandoWindowsUrl)">
            <v-icon start>$si-windows</v-icon>
            Windows Installer (.exe)
          </v-list-item>
          <v-list-item :disabled="!latestRandoLinuxUrl" @click="downloadRando(latestRandoLinuxUrl)">
            <v-icon start>$si-linux</v-icon>
            Linux Package (.tar.gz)
          </v-list-item>
        </v-list>
      </v-menu>
      <v-btn variant="text" border="md" size="x-large" to="/seedgen">
        <v-icon start>mdi-dice-multiple</v-icon>
        Generate a seed
      </v-btn>
      <v-btn size="x-large" variant="text" border="md" target="_blank" :href="wikiUrl">
        <v-icon start>mdi-book-outline</v-icon>
        Wiki
      </v-btn>
      <v-menu offset-y>
        <template #activator="{ props }">
          <v-btn
            size="x-large"
            variant="text"
            border="md"
            v-bind="props"
          >
            <!--            TODO Discord Icon-->
            Discord
          </v-btn>
        </template>

        <v-list>
          <v-list-item target="_blank" :href="discordDevUrl">
            <v-icon start size="large">mdi-information-variant-box-outline</v-icon>
            Development
          </v-list-item>
          <v-list-item target="_blank" :href="discordSpeedrunUrl">
            <v-icon start size="large">mdi-gamepad-variant-outline</v-icon>
            Speedrun
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
  </div>
</template>

<script lang="ts" setup>

  const wikiUrl = ref("https://wiki.orirando.com")
  const discordDevUrl = ref("https://discord.com/invite/sfUr8ra5P7")
  const discordSpeedrunUrl = ref("https://discord.com/invite/SUS57PWWnA")
  const lurkTimeoutId = ref<NodeJS.Timeout | null>(null)
  const buttonLurking = ref(false)

  onMounted(() => {
    lurkAfterRandomTime()
  })

  const lurkAfterRandomTime = (() => {
    lurkTimeoutId.value = setTimeout(() => {
      buttonLurking.value = !buttonLurking.value

      lurkAfterRandomTime()
    }, 2000 + Math.random() * 10000)
  })

</script>

<style lang="scss" scoped>
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

</style>
