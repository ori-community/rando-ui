<template>
  <v-container>
    <h1 class="text-center mt-12 mb-2">Randomizer League</h1>
    <div class="text-center mb-12">
      <v-btn text large outlined @click="showLeagueInfo = true">
        <v-icon left>mdi-information-outline</v-icon>
        FAQ / Help
      </v-btn>
    </div>

    <template v-if="categorizedSeasons.active.length > 0 || categorizedSeasons.upcoming.length > 0">
      <h2 class="mt-5 mb-2">Active & Upcoming Seasons</h2>

      <div class="seasons-container">
        <league-season-card
          v-for="season in categorizedSeasons.active"
          :key="season.id"
          :season="season"
          mode="active"
          :joined="userIsMemberOfSeason(season)"
        />
        <league-season-card
          v-for="season in categorizedSeasons.upcoming"
          :key="season.id"
          :season="season"
          mode="upcoming"
          :joined="userIsMemberOfSeason(season)"
        />
      </div>
    </template>

    <div v-if="categorizedSeasons.past.length > 0" class="past-seasons">
      <h2 class="mt-5 mb-2">Past Seasons</h2>
      <div class="seasons-container">
        <league-season-card
          v-for="season in categorizedSeasons.past"
          :key="season.id"
          :season="season"
          :joined="userIsMemberOfSeason(season)"
        />
      </div>
    </div>

    <v-dialog v-model="showLeagueInfo" max-width="800" content-class="elevation-0">
      <v-expansion-panels popout multiple mandatory>
        <v-expansion-panel>
          <v-expansion-panel-header class="font-weight-bold title">
            What is the Randomizer League?
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            The Randomizer League is a new game mode for the Ori and the Will of the Wisps Randomizer which
            allows multiple players to compete against each other asynchronously. All players play the same
            seeds but don't have to do so at the same time. Instead, each player can complete each game in
            a given time frame.
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-header class="font-weight-bold title">
            What are Seasons?
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            Each season is a set of games which player can compete in. Every season has its own leaderboard
            and games of a season are counted towards the player's ranking on the leaderboard of that season.
            There can be multiple seasons in parallel. This allows for different seasons with unique seed settings,
            for example different difficulty levels.
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-header class="font-weight-bold title">
            How can I play games in the Randomizer League?
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            To play games in the Randomizer League, you need to first pick an upcoming season and join it.
            Joining seasons is possible until the first game of that season is finished. While it is possible
            to play without being a member in the Ori Runs Discord server, it is heavily advised to be part
            of it to receive pings and reminders for your joined seasons as well as being added to spoiler
            discussion channels after you finished a game.<br>
            Once the season started, games will be created automatically in fixed intervals. You can then
            play these games whenever you want until they expire and the next game is created or the season is
            over.
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-header class="font-weight-bold title">
            How are points calculated?
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            After a game is finished, players who submitted a run are awarded two types of points:

            <ul class="mb-2">
              <li>
                <span class="font-italic">Base Points</span><br>
                Base Points are awarded to all players who submitted a run, regardless of their time.
              </li>
              <li>
                <span class="font-italic">Speed Points</span><br>
                Speed Points are awarded to players depending on their run time in relation to the fastest player.
              </li>
            </ul>

            <h3>Example:</h3>
            The season in this example uses <span class="text-decoration-underline">10 Base Points</span>,
            <span class="text-decoration-underline">190 Speed Points</span> and a
            <span class="text-decoration-underline">Speed Factor of 2.0</span>. The fastest player has a time of
            <span class="text-decoration-underline">01:00:00</span>.<br>
            If you finish with a time of 01:30:00, you are awarded 105 points in total:

            <ul>
              <li>10 Base Points for finishing</li>
              <li>95 Speed Points for speed (fastest time = all Speed Points, fastest time * Speed Factor = no Speed Points, 190 * 0.5 = 95)</li>
            </ul>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-header class="font-weight-bold title">
            How do I submit a run?
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            The Randomizer League is deeply integrated into the Randomizer itself. Submission and basic validation
            of games is done automatically. If you want to submit a recording of your run alongside the submitted time,
            you can do so after finishing your run on the game page.
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-dialog>
  </v-container>
</template>

<script>

  // TODO:
  // general league ruleset
  // update list by seasons change (for example new season added, season ended, member joined)

  import { mapGetters, mapState } from 'vuex'

  export default {
    data: () => ({
      seasonsLoading: false,
      leagueSeasons: [],
      showLeagueInfo: false,
    }),
    computed: {
      ...mapState('user', ['user']),
      ...mapGetters('user', ['isLoggedIn', 'isDeveloper']),
      categorizedSeasons() {
        const value = {
          upcoming: [],
          active: [],
          past: [],
        }

        for (const season of this.leagueSeasons) {
          if (season.canJoin && season.currentGameId === null) {
            value.upcoming.push(season)
          } else if (season.currentGameId !== null) {
            value.active.push(season)
          } else {
            value.past.push(season)
          }
        }

        return value
      },
    },
    mounted() {
      this.loadSeasons()
    },
    methods: {
      async loadSeasons() {
        this.seasonsLoading = true

        try {
          this.leagueSeasons = await this.$axios.$get('/league/seasons')
        } catch (e) {
          console.error(e)
        }

        this.seasonsLoading = false
      },
      userIsMemberOfSeason(season) {
        return season.memberships?.some((m) => m.user.id === this.user?.id)
      },
    },
  }
</script>

<style lang="scss" scoped>
  .seasons-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    grid-auto-rows: 1fr;
    gap: 1em;
  }

  .past-seasons {
    opacity: 0.4;
    transition: opacity 300ms;

    &:hover {
      opacity: 1.0;
    }
  }
</style>
