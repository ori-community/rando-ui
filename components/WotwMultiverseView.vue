<template>
  <div>
    <v-scroll-y-reverse-transition leave-absolute group tag="div" class="universes">
      <wotw-universe-view
        v-for="universe in multiverse.universes"
        :key="universe.id"
        :can-join="!isSpectating && !multiverse.locked"
        :can-create-world="multiverse.seedId === null && !multiverse.locked"
        :disabled="loading"
        :hide-color="multiverse.universes.length < 2"
        :universe="universe"
        :multiverse-id="multiverseId"
        :race-starting-at="raceStartingAt"
        :player-in-game-times="playerInGameTimes"
        :player-finished-times="playerFinishedTimes"
        :world-finished-times="worldFinishedTimes"
        :finished-at="universeFinishedTimes[universe.id] ?? null"
        :place="universePlaces[universe.id] ?? null"
        :seed-spoiler-downloaded-by-ids="multiverse.seedSpoilerDownloadedBy.map(u => u.id)"
        class="universe-view"
        @join-world="(worldId) => join(worldId)"
        @new-world="createWorld(universe.id)"
      />
    </v-scroll-y-reverse-transition>

    <div v-if="isSpectating" class="text-center mt-4">
      <v-alert class="d-inline-block" color="info darken">
        <v-icon left>mdi-monitor-eye</v-icon>
        You are spectating this game.
      </v-alert>
    </div>
    <div v-else-if="multiverse.locked" class="text-center mt-4">
      <v-alert class="d-inline-block" color="info darken">
        <v-icon left>mdi-lock</v-icon>
        This multiverse is locked.
      </v-alert>
    </div>
    <div v-else class="action-buttons mt-4">
      <v-tooltip :disabled="canCreateUniverse" bottom>
        <span> You ran out of space in your multiverse. </span>
        <template #activator="{ on }">
          <div class="d-inline-block" v-on="on">
            <v-btn :disabled="loading || !canCreateUniverse" large text @click="createWorld()">
              <v-icon left>mdi-plus</v-icon>
              New Universe
            </v-btn>
          </div>
        </template>
      </v-tooltip>

      <slot name="additional-buttons" />
    </div>
  </div>
</template>

<script>
  import { mapGetters, mapState } from 'vuex'
  import { hasOwnProperty } from '~/assets/lib/hasOwnProperty'

  const isOBS = () => !!window?.obsstudio?.pluginVersion

  export default {
    name: 'WotwMultiverseView',
    props: {
      isSpectating: {
        type: Boolean,
        default: false,
      },
      multiverse: {
        type: Object,
        required: true,
      },
      raceStartingAt: {
        type: Number,
        required: false,
        default: null,
      },
      playerInGameTimes: {
        type: Object,
        required: false,
        default: () => ({}),
      },
      playerFinishedTimes: {
        type: Object,
        required: false,
        default: () => ({}),
      },
      worldFinishedTimes: {
        type: Object,
        required: false,
        default: () => ({}),
      },
      universeFinishedTimes: {
        type: Object,
        required: false,
        default: () => ({}),
      },
    },
    data: () => ({
      loading: false,
      embedUrlLoading: false,
      embedUrlCopied: false,
      multiverseReady: false,
    }),
    computed: {
      ...mapGetters('user', ['isLoggedIn']),
      ...mapState('user', ['user', 'userLoaded']),
      isOBS() {
        return isOBS()
      },
      multiverseId() {
        return this.multiverse.id
      },
      canCreateUniverse() {
        return this.multiverse.universes.length < 8
      },
      ownUniverse() {
        return this.multiverse.universes.find((universe) =>
          universe.worlds.find((world) => world.members.find((player) => player.id === this.user?.id)),
        )
      },
      ownUniverseId() {
        return this.ownUniverse?.id
      },
      highlightedUniverseId() {
        if (!this.boardSettings.highlightOwnUniverse) {
          return null
        }

        return this.ownUniverseId
      },
      universePlaces() {
        const universePlaces = Object.fromEntries(
          Object.entries(this.universeFinishedTimes)
            .filter(([, time]) => time !== 0.0)
            .sort(([, aTime], [, bTime]) => aTime - bTime)
            .map((entry, index) => [entry[0], index + 1])
        )

        return Object.fromEntries(
          Object.entries(this.universeFinishedTimes)
            .sort(([, aTime], [, bTime]) => aTime - bTime)
            .map((entry) => [/** universe id → */ entry[0], entry[1] !== 0.0 ? universePlaces[entry[0]] : 'F'])
        )
      }
    },
    watch: {
      userLoaded: {
        immediate: true,
        async handler(userLoaded) {
          if (userLoaded && !this.isLoggedIn) {
            if (this.$route.query.jwt) {
              await this.$store.dispatch('auth/setJwt', this.$route.query.jwt)
              await this.$store.dispatch('user/updateUser')
            }
          }
        },
      },
      'multiverse.universes'() {
        // TODO: Temporary workaround for orirando/wotw-server#5
        if (this.multiverse.bingoBoard) {
          this.$store.dispatch('multiverseState/fetchBingoBoard', this.multiverseId)
        }
      },
    },
    mounted() {
      console.log(this.multiverse)
    },
    methods: {
      hasOwnProperty,
      async join(worldId) {
        await this.$axios.post(`/multiverses/${this.multiverseId}/worlds/${worldId}`)
        await this.$store.dispatch('multiverseState/connectMultiverse', {
          multiverseId: this.multiverseId,
          reconnect: true,
        })
        this.$store.commit('user/setCurrentMultiverseId', this.multiverseId)
      },
      async createWorld(universeId = null) {
        await this.$axios.post(`/multiverses/${this.multiverseId}/${universeId}/worlds`)
        this.$store.commit('user/setCurrentMultiverseId', this.multiverseId)
      },
    },
  }
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
