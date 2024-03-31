<template>
  <v-container>
    <throttled-spinner>
      <div v-if="leagueSeason !== null">
        <h1 class="text-center mt-12 mb-6">{{ leagueSeason.name }}</h1>

        <div class="mb-2">
          <v-btn text @click="showSeasonInfo = true"><v-icon left>mdi-information-outline</v-icon>Info</v-btn>
          <v-btn text @click="showSeasonRules = true"><v-icon left>mdi-book-open-outline</v-icon>Rules</v-btn>
          <v-btn
            v-if="!isJoined"
            color="accent"
            :loading="actionLoading"
            :disabled="!canJoin"
            @click="joinSeason"
          >
            <v-icon left>mdi-plus-circle-outline</v-icon>
            Join
          </v-btn>
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
          <div>
            <div class="games-list">
              <league-game-card v-if="currentGame !== null" :game="currentGame" />
              <h3 v-if="pastGames.length > 0" class="text-center" :class="{'mt-3': currentGame !== null}">Past Games</h3>
              <v-data-table disable-pagination hide-default-footer /> <!-- TODO -->
            </div>
          </div>
        </div>
        <!-- <pre>{{ leagueSeason }}</pre> -->
      </div>
    </throttled-spinner>
    <v-dialog v-model="showSeasonInfo" max-width="800">
      <v-card class="pa-5">
        <div v-if="leagueSeason">
          <div v-html="longDescriptionHtml"></div>
        </div>
      </v-card>
    </v-dialog>
    <v-dialog v-model="showSeasonRules" max-width="800">
      <v-card class="pa-5">
        <div v-if="leagueSeason">
          <div v-html="rulesHtml"></div>
        </div>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
  // TODO
  // update lists when something changes

  import { mapGetters, mapState } from 'vuex'
  import { renderMarkdown } from '~/assets/lib/markdown'

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
        return this.leagueSeason !== null && this.leagueSeason.memberships.some((m) => m.user.id === this.user?.id)
      },
      canJoin() {
        return this.leagueSeason !== null && this.leagueSeason.canJoin && this.isLoggedIn && !this.isJoined
      },
      sortedMembers() {
        return this.leagueSeason?.memberships?.toSorted((a, b) => b.points - a.points) ?? []
      },
      rulesHtml() {
        return renderMarkdown(this.leagueSeason.rulesMarkdown)
      },
      longDescriptionHtml() {
        return renderMarkdown(this.leagueSeason.longDescriptionMarkdown)
      },
      currentGame() {
        return this.leagueSeason?.games?.find(g => g.isCurrent)
      },
      pastGames() {
        return this.leagueSeason?.games?.filter(g => !g.isCurrent)
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
    grid-template-columns: 2fr 1fr;
    grid-auto-flow: column;
    gap: 1em;

    @media (max-width: 900px) {
      grid-template-columns: 1fr;
      grid-auto-flow: row;
    }
  }

  .leaderboard {
    display: grid;
    grid-template-columns: 0.5fr 5fr 1fr;
  }

  .games-list {
    display: flex;
    flex-direction: column;
    gap: 0.75em;
  }
</style>
