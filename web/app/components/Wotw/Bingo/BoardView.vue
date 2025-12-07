<template>
  <div>
    <v-container>
      <h2 class="text-center mb-3 mt-8">Bingo board</h2>

      <div class="text-center mb-1">
        <v-btn text @click="centerBoard">
          <template v-if="showBoard">
            <v-icon left>mdi-image-filter-center-focus-strong-outline</v-icon>
            Center on screen
          </template>
          <template v-else>
            <v-icon left>mdi-eye-outline</v-icon>
            Show board
          </template>
        </v-btn>
        <v-btn v-if="isElectron" :disabled="bingoOverlayEnabled" text @click="enableBingoOverlay">
          <template v-if="bingoOverlayEnabled">
            <v-icon left>mdi-check</v-icon>
            Overlay enabled
          </template>
          <template v-else>
            <v-icon left>mdi-semantic-web</v-icon>
            Enable Overlay
          </template>
        </v-btn>
        <v-btn text :disabled="isSpectating" @click="spectateDialogOpen = true">
          <v-icon left>mdi-monitor-eye</v-icon>
          Spectate
        </v-btn>

        <v-menu offset-y :close-on-content-click="!embedUrlLoading && !bingothonTokenLoading">
          <template #activator="{ props }">
            <v-btn icon class="ml-2" v-bind="props">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="boardSettingsOpen = true">
              <v-icon left>mdi-cog-outline</v-icon>
              Settings
            </v-list-item>
            <v-list-item :disabled="embedUrlCopied || embedUrlLoading" @click="createEmbedUrl">
              <template v-if="embedUrlCopied">
                <v-icon left>mdi-check</v-icon>
                URL Copied
              </template>
              <template v-else>
                <v-icon left>mdi-semantic-web</v-icon>
                <template v-if="embedUrlLoading">Generating URL...</template>
                <template v-else>Embed (OBS)</template>
              </template>
            </v-list-item>
            <v-list-item :disabled="bingothonTokenCopied || bingothonTokenLoading" @click="createBingothonToken">
              <template v-if="bingothonTokenCopied">
                <v-icon left>mdi-check</v-icon>
                Token Copied
              </template>
              <template v-else>
                <v-icon left>mdi-key</v-icon>
                <template v-if="bingothonTokenLoading">Generating Token...</template>
                <template v-else>Create Bingothon Token</template>
              </template>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-container>

    <!--   TODO set obsMode   -->
    <div ref="boardContainer" :class="{ 'px-1': !boardSettingObsMode }" class="board-container">
      <template v-if="showBoard">
        <wotw-bingo-board
          :edge-labels="boardSettingEdgeLabels"
          :is-spectating="isSpectating"
          :multiverse-id="multiverse.id"
          :hidden-universes="hiddenUniverses"
          :highlighted-universe="highlightedUniverseId"
          :own-universe-id="ownUniverseId"
          :card-attention-effect="boardSettingCardAttentionEffect"
          :spectator-display-all="boardSettingSpectatorDisplayAll"
          class="board"
        />
        <div class="sidebar px-5">
          <transition-group class="bingo-universes" name="list">
            <div
              v-for="(bingoUniverse, index) in sortedBingoUniverses"
              :key="bingoUniverse.universeId"
              :style="{ zIndex: sortedBingoUniverses.length - index }"
              class="relative"
            >
              <wotw-bingo-universe-view
                :bingo-universe="bingoUniverse"
                :is-spectating="isSpectating"
                :universe="multiverse.universes.find((u) => u.id === bingoUniverse.universeId)"
                :universe-hidden="hiddenUniverses.includes(bingoUniverse.universeId)"
                @click="toggleUniverseVisibility(bingoUniverse.universeId)"
                @click.native.ctrl.capture.stop="toggleUniverseVisibility(bingoUniverse.universeId, true)"
              />
            </div>
            <v-switch
              v-if="isSpectating"
              key="spectatorMode"
              v-model="boardSettingSpectatorDisplayAll"
              label="Show all cards"
              inset
            />
            <div
              v-if="!boardSettingHideSpectators && multiverse.spectators.length > 0"
              key="spectators"
              class="mt-4"
            >
              <div class="text-caption">Spectators</div>

              <rando-discord-avatar v-for="spectator in multiverse.spectators" :key="spectator.id" :user="spectator">
                <v-tooltip location="top" activator="parent">
                  <span>{{ spectator.name }}</span>
                </v-tooltip>
              </rando-discord-avatar>
            </div>
          </transition-group>
        </div>
      </template>
    </div>

    <v-dialog v-model="boardSettingsOpen" max-width="500">
      <v-card class="pa-5 relative">
        <h2>Bingo settings</h2>

        <v-btn class="close-button" color="background lighten-5" icon @click="boardSettingsOpen = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>

        <v-checkbox
          v-model="boardSettingEdgeLabels"
          hint="Show coordinates around the board"
          label="Edge Labels"
          persistent-hint
        />

        <v-checkbox
          v-model="boardSettingHighlightOwnUniverse"
          hint="Reserve bottom left parts of bingo squares for your team. Greatly improves overview of your progress."
          label="Highlight own team"
          persistent-hint
        />

        <v-checkbox
          v-model="boardSettingHideSpectators"
          hint="Hide spectators from the player list next to the board"
          label="Hide spectators"
          persistent-hint
        />

        <v-checkbox
          v-model="boardSettingCardAttentionEffect"
          hint="Flash cards when their value changes"
          label="Flash cards"
          persistent-hint
        />
      </v-card>
    </v-dialog>

    <v-dialog v-model="spectateDialogOpen" :persistent="spectateLoading" max-width="500">
      <v-card class="pa-5 relative">
        <h2>Spectate this game</h2>
        Spectating the game lets you see all squares or the those visible by the teams<br/>
        Please note that you <b>cannot join this game anymore</b> after you chose to spectate.

        <div class="d-flex justify-end">
          <v-btn :disabled="spectateLoading" class="mr-1" text @click="spectateDialogOpen = false"> Cancel</v-btn>
          <v-btn :loading="spectateLoading" color="accent" depressed @click="spectate"> Spectate</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts" setup>
  import type {MultiverseInfo, BingoUniverseInfo, WorldInfo} from '@shared/types/http-api'

  const isElectron = useIsElectron()
  const router = useRouter()
  const {axios} = useAxios()

  const embedUrlCopied = ref(false)
  const embedUrlLoading = ref(false)
  const boardSettingsOpen = ref(false)
  const boardSettingEdgeLabels = ref(false)
  const boardSettingHighlightOwnUniverse = ref(true)
  const boardSettingHideSpectators = ref(false)
  const boardSettingCardAttentionEffect = ref(true)
  const boardSettingSpectatorDisplayAll = ref(false)
  const spectateDialogOpen = ref(false)
  const spectateLoading = ref(false)
  const hiddenUniverses = ref<number[]>([]) // Array of team IDs
  const bingothonTokenLoading = ref(false)
  const bingothonTokenCopied = ref(false)
  const bingoOverlayEnabled = ref(false)
  const showBoard = ref(false)

  // TODO OBS
  // isOBS() {
  //   return isOBS()
  // },

  const props = defineProps<{
    multiverse: MultiverseInfo,
    bingoUniverses: BingoUniverseInfo[],
    isSpectating: boolean,
    ownWorld: WorldInfo | null,
  }>()

  const centerBoard = (() => {
    // this.$refs.boardContainer.scrollIntoView({
    //   behavior: showBoard.value ? 'smooth' : 'auto',
    //   block: 'start',
    // })
    showBoard.value = true
  })

  const sortedBingoUniverses = computed(() => {
    if (!props.multiverse) {
      return []
    }

    // Only return bingo teams for which we have a team
    const universes = props.multiverse.universes
    return [...props.bingoUniverses.filter((b) => universes.some((u) => u.id === b.universeId))].sort(
      (a, b) => {
        const aRank = hiddenUniverses.value.includes(a.universeId) || props.isSpectating ? 0 : a.rank
        const bRank = hiddenUniverses.value.includes(b.universeId) || props.isSpectating ? 0 : b.rank

        const rankDifference = bRank - aRank

        if (rankDifference === 0) {
          return a.universeId - b.universeId
        }

        return rankDifference
      },
    )
  })

  const highlightedUniverseId = computed(() => {
    if (!boardSettingHighlightOwnUniverse.value || props.multiverse.universes.length <= 1) {
      return null
    }
    return ownUniverseId.value
  })

  const ownUniverse = computed(() => {
    if (!ownWorld.value) {
      return null
    }

    return multiverse.value.universes.find((universe) =>
      universe.worlds.find((world) => world.id === ownWorld?.value.id),
    )
  })
  const ownUniverseId = computed(() => {
    return 0
    // return ownUniverse?.value.id
  })

  const toggleUniverseVisibility = ((universeId: number, exclusive = false) => {
    if (exclusive) {
      if (
        hiddenUniverses.value.length === sortedBingoUniverses.value.length - 1 &&
        !hiddenUniverses.value.includes(universeId)
      ) {
        hiddenUniverses.value = []
      } else {
        hiddenUniverses.value = sortedBingoUniverses.value.map((b) => b.universeId).filter((u) => u !== universeId)
      }
    } else if (hiddenUniverses.value.includes(universeId)) {
      hiddenUniverses.value = hiddenUniverses.value.filter((u) => u !== universeId)
    } else {
      hiddenUniverses.value.push(universeId)
    }
  })

  const createBingothonToken = (async () => {
    bingothonTokenLoading.value = true

    const token = await axios.post('/bingothon/token', {
      multiverseId: props.multiverse.id,
    })

    await window.navigator.clipboard.writeText(token.toString())

    bingothonTokenLoading.value = false
    bingothonTokenCopied.value = true

    setTimeout(() => {
      bingothonTokenCopied.value = false
    }, 4000)
  })

  const createEmbedUrl = (async () => {
    embedUrlLoading.value = true

    const token = await axios.post('/tokens/', {
      scopes: ['boards.read', 'user.info.read'],
    })

    const targetRoute = router.resolve({
      name: 'game-multiverseId',
      params: {
        multiverseId: props.multiverse.id,
      },
      query: {
        jwt: token,
      },
    })

    const url = new URL(targetRoute.href.replace('#/', ''), this.$paths.UI_BASE_URL)
    await window.navigator.clipboard.writeText(url.toString())

    embedUrlLoading.value = false

    embedUrlCopied.value = true

    setTimeout(() => {
      embedUrlCopied.value = false
    }, 4000)
  })

  const spectate = (async () => {
    spectateLoading.value = true

    try {
      // TODO multiverseState
      // await this.$store.dispatch('multiverseState/spectateMultiverse', multiverse.value.id)
      spectateDialogOpen.value = false
      if (!showBoard.value) {
        // TODO center bingo board
        // centerBoard.value()
      }
    } catch (e) {
      console.error(e)
    }
    spectateLoading.value = false
  })

  const enableBingoOverlay = (async () => {
    await electronApi.invoke('bingoBoardOverlay.prepare', props.multiverse.id)
    bingoOverlayEnabled.value = true

    setTimeout(() => {
      bingoOverlayEnabled.value = false
    }, 5000)
  })

</script>

<style lang="scss" scoped>
  .board-container {
    display: flex;
    min-height: 100vh;

    .board {
      flex-grow: 0;
      flex-shrink: 0;
      height: 100vh;
      width: 100vh;
    }

    .sidebar {
      align-items: center;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      justify-content: center;

      .bingo-universes {
        display: flex;
        flex-direction: column;
        gap: 0.3em;
        justify-content: stretch;
      }
    }
  }
</style>
