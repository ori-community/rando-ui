<template>
  <div>
    <v-scroll-y-reverse-transition leave-absolute group tag="div" class="universes">
      <wotw-multiverse-universe-view
        v-for="universe in multiverse.universes"
        :key="universe.id"
        :can-join="!preview && !multiverse.locked"
        :can-create-world="multiverse.seedId === null && !multiverse.locked"
        :disabled="loading"
        :hide-color="multiverse.universes.length < 2 && !multiverse.hasBingoBoard"
        :universe="universe"
        :race-starting-at="raceStartingAt"
        :player-in-game-times="playerInGameTimes"
        :player-finished-times="playerFinishedTimes"
        :world-finished-times="worldFinishedTimes"
        :finished-at="universeFinishedTimes[universe.id] ?? null"
        :rank="universePlaces[universe.id] ?? null"
        :seed-spoiler-downloaded-by-ids="multiverse.seedSpoilerDownloadedBy.map(u => u.id)"
        :connected-user-ids="multiverse.connectedUserIds"
        :race-ready-user-ids="multiverse.raceReadyUserIds"
        class="universe-view"
        @join-world="(worldId: number) => join(worldId)"
        @new-world="createWorld(universe.id)"
      />
    </v-scroll-y-reverse-transition>

    <div v-if="preview" class="text-center mt-4">
      <template v-if="showSpectatorNotice">
        <v-alert class="d-inline-block" color="info darken">
          <v-icon start>mdi-monitor-eye</v-icon>
          You are spectating this game.
        </v-alert>
      </template>
    </div>
    <div v-else-if="multiverse.locked" class="text-center mt-4">
      <v-alert class="d-inline-block" color="info darken">
        <v-icon start>mdi-lock</v-icon>
        This multiverse is locked.
      </v-alert>
    </div>
    <div v-else class="action-buttons mt-4">
      <div class="d-inline-block">
        <v-btn :disabled="loading || !canCreateUniverse" large variant="text" @click="createWorld()">
          <v-icon start>mdi-plus</v-icon>
          New Universe
        </v-btn>
        <v-tooltip :disabled="canCreateUniverse" location="bottom" activator="parent">
          <span> You ran out of space in your multiverse. </span>
        </v-tooltip>
      </div>
      <slot name="additional-buttons"/>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type {MultiverseInfo} from "@shared/types/http-api"

  // TODO isOBS
  // const isOBS = () => !!window?.obsstudio?.pluginVersion

  const props = withDefaults(defineProps<{
    preview?: boolean,
    multiverse: MultiverseInfo,
    raceStartingAt?: number | null,
    playerInGameTimes?: { [key: number]: number },
    playerFinishedTimes?: { [key: number]: number },
    worldFinishedTimes?: { [key: number]: number },
    universeFinishedTimes?: { [key: number]: number },
    showSpectatorNotice?: boolean,
  }>(), {
    preview: false,
    raceStartingAt: null,
    playerInGameTimes: () => ({}),
    playerFinishedTimes: () => ({}),
    worldFinishedTimes: () => ({}),
    universeFinishedTimes: () => ({}),
    showSpectatorNotice: false,
  })

  const loading = ref(false)
  const embedUrlLoading = ref(false)
  const embedUrlCopied = ref(false)
  const multiverseReady = ref(false)
  const userStore = useUserStore()
  const {axios} = useAxios()
  const route = useRoute()

  // TODO isOBS
  const isOBS = computed(() => {
    return false
  })
  const canCreateUniverse = computed(() => {
    return props.multiverse.universes.length < 8
  })
  const ownUniverse = computed(() => {
    return props.multiverse.universes.find((universe) =>
      universe.worlds.find(world => world.memberships.find(m => m.user?.id === userStore.user?.id)),
    )
  })
  const ownUniverseId = computed(() => {
    return ownUniverse.value?.id
  })
  const universePlaces = computed(() => {
    const universePlaces = Object.fromEntries(
      Object.entries(props.universeFinishedTimes)
        .filter(([, time]) => time !== 0.0)
        .sort(([, aTime], [, bTime]) => aTime - bTime)
        .map((entry, index) => [entry[0], index + 1])
    )

    return Object.fromEntries(
      Object.entries(props.universeFinishedTimes)
        .sort(([, aTime], [, bTime]) => aTime - bTime)
        .map((entry) => [/** universe id → */ entry[0], entry[1] !== 0.0 ? universePlaces[entry[0]] : 'F'])
    )
  })

  const join = (async (worldId: number) => {
    await axios.post(`/multiverses/${props.multiverse.id}/worlds/${worldId}`)
  })

  const createWorld = (async (universeId: number | null = null) => {
    await axios.post(`/multiverses/${props.multiverse.id}/${universeId}/worlds`)
  })
</script>

<style lang="scss" scoped>
  .universes {
    align-items: flex-start;
    display: flex;
    flex-wrap: wrap;
    gap: 2em;
    justify-content: center;

    .universe-view {
      min-width: 15vw;
    }
  }

  .action-buttons {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1em;
  }
</style>
