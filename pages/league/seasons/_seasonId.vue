<template>
  <v-container>
    <throttled-spinner>
      <div v-if="leagueSeason !== null">
        <h1 class="text-center mt-12 mb-6">Season {{ leagueSeason.name }}</h1>

        <div class="mb-2">
          <v-btn text @click="showSeasonInfo = true"><v-icon left>mdi-information-outline</v-icon>Info</v-btn>
          <v-btn text @click="showSeasonRules = true"><v-icon left>mdi-book-open-outline</v-icon>Rules</v-btn>
          <v-btn v-if="!isJoined" color="accent" :loading="actionLoading" :disabled="!canJoin" @click="joinSeason"
            >Join</v-btn
          >
          <v-btn
            text
            :loading="actionLoading"
            :disabled="leagueSeason.currentGameId === null"
            :to="{ name: 'league-game-gameId', params: { gameId: leagueSeason.currentGameId } }"
          >
            <v-icon left>mdi-gamepad-variant-outline</v-icon>
            Current game
          </v-btn>
        </div>
        <div class="tables-container">
          <v-card class="pa-5">
            <h2 class="text-center mb-5">Leaderboard</h2>
            <div class="leaderboard" :style="{ gridTemplateRows: `repeat(${sortedMembers.length + 1}, 1fr)` }">
              <div>#</div>
              <div>Member</div>
              <div>Points</div>
              <template v-for="member in sortedMembers">
                <div :key="`${member.user.id}-rank`">{{ member.rank }}</div>
                <div :key="`${member.user.id}-name`">
                  <discord-avatar :user="member.user" class="mr-1" />{{ member.user.name }}
                </div>
                <div :key="`${member.user.id}-points`">{{ member.points }}</div>
              </template>
            </div>
            <div v-if="!(sortedMembers.length > 0) && canJoin" class="mt-5">Be the first to <b>JOIN!</b></div>
          </v-card>
          <v-card class="pa-5">
            <h2 class="text-center mb-5">Games</h2>
            <div class="gameslist" :style="{ gridTemplateRows: `repeat(${leagueSeason.games.length + 1}, 1fr)` }">
              <div>#</div>
              <div>Open until</div>
              <div>Submissions</div>
              <template v-for="game in leagueSeason.games">
                <v-btn :key="`${game.id}-nr`" :to="{ name: 'league-game-gameId', params: { gameId: game.id } }">
                  #{{ game.gameNumber }}
                  <v-icon right>mdi-gamepad-variant-outline</v-icon>
                </v-btn>
                <div :key="`${game.id}-date`">todo</div>
                <div :key="`${game.id}-submits`">todo</div>
              </template>
            </div>
          </v-card>
        </div>
        <!-- <pre>{{ leagueSeason }}</pre> -->
      </div>
      <v-dialog v-model="showSeasonInfo" max-width="800">
        <v-card class="pa-5">
          <div v-if="leagueSeason">
            <div v-html="leagueSeason.longDescriptionMarkdown"></div>
          </div>
        </v-card>
      </v-dialog>
      <v-dialog v-model="showSeasonRules" max-width="800">
        <v-card class="pa-5">
          <div v-if="leagueSeason">
            <div v-html="leagueSeason.rulesMarkdown"></div>
          </div>
        </v-card>
      </v-dialog>
    </throttled-spinner>
  </v-container>
</template>

<script>

  // TODO
  // update lists when something changes

  import { mapGetters, mapState } from 'vuex'

  export default {
    data: () => ({
      leagueSeason: null,
      actionLoading: false,
      displayedTab: null,
      showSeasonInfo: false,
      showSeasonRules: false,
    }),
    computed: {
      ...mapState('user', ['user']),
      ...mapGetters('user', ['isLoggedIn']),
      isJoined() {
        return this.leagueSeason.memberships.some((m) => m.user.id === this.user.id)
      },
      canJoin() {
        return this.leagueSeason !== null && this.leagueSeason.canJoin && this.isLoggedIn && !this.isJoined
      },
      sortedMembers() {
        return [...this.leagueSeason.memberships].sort((a, b) => b.points - a.points)
      },
    },
    watch: {
      '$route.params.seasonId': {
        immediate: true,
        handler() {
          this.loadSeason()
        },
      },
    },
    methods: {
      async loadSeason() {
        try {
          this.leagueSeason = await this.$axios.$get(`/league/seasons/${this.$route.params.seasonId}`)
        } catch (e) {
          console.error(e)
        }
      },
      async joinSeason() {
        this.actionLoading = true

        try {
          this.leagueSeason = await this.$axios.$post(`/league/seasons/${this.$route.params.seasonId}/membership`)
        } catch (e) {
          console.error(e)
        }

        this.actionLoading = false
      },
    },
  }
</script>

<style lang="scss" scoped>
  .tables-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-auto-flow: column;
    grid-template-rows: 100%;
    gap: 1em;

    @media (max-width: 900px) {
      grid-template-columns: 1fr;
      grid-auto-flow: row;
      grid-template-rows: repeat(2, 1fr);
    }
  }

  .leaderboard {
    display: grid;
    grid-template-columns: 0.5fr 5fr 1fr;
  }

  .gameslist {
    display: grid;
    grid-template-columns: 1fr 2fr 4fr;
  }
</style>
