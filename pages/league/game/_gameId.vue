<template>
  <v-container>
    <throttled-spinner>
      <div v-if="leagueSeason !== null && leagueGame !== null">
        <h1 class="text-center mt-12">Season {{ leagueSeason.name }}</h1>
        <h2 class="text-center mb-6">Game #{{ leagueGame.gameNumber }}</h2>
        <div class="d-flex justify-center align-center">
          <v-btn x-large color="accent" @click="launchGame()">
            <img class="launch-icon" src="../../../assets/images/launch.png" alt="" />
            Launch
          </v-btn>
        </div>
        <v-btn text :to="{ name: 'league-seasons-seasonId', params: { seasonId: leagueGame.seasonId } }">
          <v-icon>mdi-arrow-left-thin</v-icon>
          Go Back
        </v-btn>
        <v-card class="pa-5">
          <div v-for="submission in gameSubmissions" :key="submission.id">
            <div>
              {{ submission.membership.user.name }}
            </div>
          </div>
          <div v-if="!(gameSubmissions?.length > 0)">Be the first to submit</div>
        </v-card>
        <!-- <pre>{{ leagueGame }}</pre> -->
        <!-- <pre>{{ gameSubmissions }}</pre> -->
      </div>
    </throttled-spinner>
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex'

  export default {
    data: () => ({
      leagueSeason: null,
      leagueGame: null,
      gameSubmissions: null,
      actionLoading: false,
    }),
    computed: {
      ...mapState('user', ['user']),
      ...mapGetters('user', ['isLoggedIn']),
      ...mapState('multiverseState', ['multiverses']),
      canSubmit() {
        return this.leagueGame !== null && this.leagueGame.permissions?.canSubmit
      },
      multiverse() {
        return this.multiverses[this.leagueGame.multiverseId]
      },
    },
    watch: {
      '$route.params.gameId': {
        immediate: true,
        handler() {
          this.loadGame()
        },
      },
    },
    methods: {
      async loadGame() {
        try {
          this.leagueGame = await this.$axios.$get(`/league/games/${this.$route.params.gameId}`)
          this.leagueSeason = await this.$axios.$get(`/league/seasons/${this.leagueGame.seasonId}`)
          this.gameSubmissions = await this.$axios.$get(`/league/games/${this.$route.params.gameId}/submissions`)
        } catch (e) {
          console.error(e)
        }
      },
      async launchGame() {
        await this.$store.dispatch('multiverseState/fetchMultiverse', this.leagueGame.multiverseId)

        // create world if it doesn't exist
        if (!this.ownWorld()) {
          const universeId = null
          await this.$axios.post(`/multiverses/${this.leagueGame.multiverseId}/${universeId}/worlds`)
        }

        // launch
        await window.electronApi.invoke('launcher.setNewGameSeedSource', `server:${this.leagueGame.multiverseId}`)
        await this.$store.dispatch('electron/launch')
      },
      ownWorld() {
        console.log(this.multiverse)
        if (!this.multiverse) {
          return null
        }

        for (const universe of this.multiverse.universes) {
          const world = universe.worlds.find((world) => world.members.find((player) => player.id === this.user?.id))

          if (world) {
            return world
          }
        }

        return null
      },
    },
  }
</script>

<style lang="scss" scoped>
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
</style>
