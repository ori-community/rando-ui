<template>
  <v-container class="max-w-800">
    <h1 class='text-center mt-12 mb-6'>Plandomizers</h1>
    <p class="mx-auto text-center mb-6">
      Plandomizers, or Plandos in short, are premade Seeds that can be played. Plandos are mostly used for
      special challenges or tools for Randomizer developers.
      The Randomizer comes with some bundled Plandos, which are listed here. For more Plandos made by other players
      join the Ori Runs Discord server.
    </p>

    <throttled-spinner>
      <template v-if="plandosLoaded" #content>
        <div class="d-flex flex-column ga-3 mx-auto">
          <template v-for="(plando, plandoId) in validPlandos" :key="plandoId">
            <v-card variant="flat" class="plando-card d-flex align-center">
              <div class="pl-3 pt-4 align-self-start">
                <v-icon>mdi-map-marker-path</v-icon>
              </div>
              <div class="pa-3 flex-grow-1">
                <h2>{{ plando.attributes.name ?? plandoId }}</h2>
                <p>{{ plando.attributes.description }}</p>
              </div>
              <div class="pa-2 d-flex align-self-stretch">
                <v-btn
                  variant="flat"
                  height="auto"
                  size="x-large"
                  :color="(!isLaunching || launchingPlandoId === plandoId) ? 'accent' : ''"
                  class="play-button align-self-stretch d-flex align-center justify-center"
                  :class="{persistent: launchingPlandoId === plandoId}"
                  :loading="launchingPlandoId === plandoId"
                  :disabled="isLaunching"
                  @click="launchPlando(plandoId)"
                >
                  <img
                    class="launch-icon"
                    src="@shared/images/launch.png"
                    alt=""
                  >
                  Launch
                </v-btn>
              </div>
            </v-card>
          </template>
        </div>
      </template>
    </throttled-spinner>
  </v-container>
</template>

<script lang="ts" setup>
  import type {ValidPlandoInfos} from "@shared/types/seedgen-extra"
  import {useSeedgenAxios} from "~/composables/useSeedgenAxios"
  import combineURLs from "~/assets/utils/combileURLs"
  import type {ChangedAssets, HashMapStringSchemaResultPlandoInfoString} from "@shared/types/seedgen"
  import ThrottledSpinner from "~/components/Rando/ThrottledSpinner.vue"

  const seedgenAxios = useSeedgenAxios()
  const {launch, isLaunching} = useLauncherHelper()

  const plandos = ref<HashMapStringSchemaResultPlandoInfoString>({})
  const plandosLoaded = ref(false)
  const validPlandos = computed(
    () => Object.fromEntries(
      Object.entries(plandos.value)
        .filter(([, e]) => e.status === "Ok")
        .map(([k, v]) => [k, v.value])) as ValidPlandoInfos,
  )
  const launchingPlandoId = ref<string | null>(null)

  let seedgenNotificationWebSocket: WebSocket | null

  onMounted(() => {
    updatePlandos()

    if (seedgenAxios.defaults.baseURL !== undefined) {
      seedgenNotificationWebSocket = new WebSocket(combineURLs(seedgenAxios.defaults.baseURL, "/assets/watch"))
      seedgenNotificationWebSocket.onmessage = async (message: MessageEvent<string>) => {
        const event = JSON.parse(message.data) as ChangedAssets

        if (event.plandos.length > 0) {
          await updatePlandos()
        }
      }
    }
  })

  onBeforeUnmount(() => {
    seedgenNotificationWebSocket?.close()
    seedgenNotificationWebSocket = null
  })

  async function updatePlandos() {
    plandos.value = (await seedgenAxios.get("/plandos/info")).data
    plandosLoaded.value = true
  }

  async function launchPlando(plandoId: string) {
    const plando = validPlandos.value[plandoId]

    if (!plando) {
      return
    }

    launchingPlandoId.value = plandoId
    try {
      await launch(`file:${plando.origin.path}`)
    } catch (e) {
      console.error(e)
    }
    launchingPlandoId.value = null
  }
</script>

<style lang="scss" scoped>
  .max-w-800 {
    max-width: 800px;
  }

  .launch-icon {
    height: 2.25em;
    width: auto;
    margin-right: 0.5em;
    margin-left: -0.5em;

    &.disabled {
      opacity: 0.4;
      filter: grayscale(1);
    }
  }

  .play-button {
    opacity: 0;
    transition: opacity 250ms;

    &.persistent {
      opacity: 1;
    }
  }

  .plando-card:hover {
    .play-button {
      opacity: 1;
    }
  }
</style>
