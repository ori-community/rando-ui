<template>
  <div>
    <div class='universes'>
      <wotw-universe-view
        v-for='universe in multiverse.universes'
        :key='universe.id'
        :can-join='!isSpectating'
        :disabled='loading'
        :hide-color='multiverse.universes.length < 2'
        :universe='universe'
        :multiverse-id='multiverseId'
        class='universe-view'
        @join-world='worldId => join(worldId)'
        @new-world='createWorld(universe.id)'
      />
    </div>

    <div v-if='!isSpectating' class='text-center mt-4'>
      <v-tooltip :disabled='canCreateUniverse' bottom>
        <span>
          You ran out of space in your multiverse.
        </span>
        <template #activator='{on}'>
          <div class='d-inline-block' v-on='on'>
            <v-btn :disabled='loading || !canCreateUniverse' large text @click='createWorld()'>
              <v-icon left>mdi-plus</v-icon>
              New Universe
            </v-btn>
          </div>
        </template>
      </v-tooltip>
    </div>
    <div v-else class='text-center mt-4'>
      <v-alert class='d-inline-block' color='info darken'>
        <v-icon left>mdi-monitor-eye</v-icon>
        You are spectating this game.
      </v-alert>
    </div>
  </div>
</template>

<script>
  import { mapGetters, mapState } from 'vuex'

  const isOBS = () => !!window?.obsstudio?.pluginVersion

  export default {
    name: 'WotwMultiverseView',
    props: {
      multiverse: {
        type: Object,
        required: true,
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
        return this.multiverse.universes.find(
          universe => universe.worlds.find(
            world => world.members.find(
              player => player.id === this.user?.id,
            ),
          ),
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
      isSpectating() {
        if (!this.multiverse || !this.user) {
          return false
        }

        return this.multiverse.spectators.some(s => s.id === this.user.id)
      },
    },
    watch: {
      userLoaded: {
        immediate: true,
        handler(userLoaded) {
          if (userLoaded && !this.isLoggedIn) {
            if (this.$route.query.jwt) {
              this.$store.commit('auth/setJwt', this.$route.query.jwt)
              this.$store.dispatch('user/updateUser')
            }
          }
        },
      },
      'multiverse.universes'() { // TODO: Temporary workaround for orirando/wotw-server#5
        if (this.multiverse.bingoBoard) {
          this.$store.dispatch('multiverseState/fetchBingoBoard', this.multiverseId)
        }
      },
    },
    methods: {
      async join(worldId) {
        await this.$axios.post(`/multiverses/${this.multiverseId}/worlds/${worldId}`)
        await this.$store.dispatch('multiverseState/connectMultiverse', {
          multiverseId: this.multiverseId,
          reconnect: true,
        })
      },
      async createWorld(universeId = null) {
        await this.$axios.post(`/multiverses/${this.multiverseId}/${universeId}/worlds`)
      },
    },
  }
</script>

<style lang='scss' scoped>
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
</style>
