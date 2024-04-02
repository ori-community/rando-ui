<template>
  <v-container>
    <h1 class="text-center mt-12 mb-12">Randomizer League</h1>
    <div>
      Small league introduction<br />
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua. Cursus mattis molestie a iaculis. Viverra justo nec ultrices dui. Sagittis purus sit amet volutpat
      consequat mauris nunc. Nulla aliquet enim tortor at auctor. Nibh tellus molestie nunc non. Libero enim sed
      faucibus turpis. Eget arcu dictum varius duis at consectetur lorem donec massa. Cursus vitae congue mauris rhoncus
      aenean vel elit. Elementum pulvinar etiam non quam lacus suspendisse faucibus interdum. Vitae congue mauris
      rhoncus aenean vel elit scelerisque mauris. Mi proin sed libero enim. Etiam non quam lacus suspendisse faucibus
      interdum posuere lorem ipsum. Auctor elit sed vulputate mi sit.
    </div>
    <v-btn class="mb-3" small text outlined @click="showLeagueInfo = true">
      <v-icon left>mdi-information-outline</v-icon>
      More Info
    </v-btn>

    <template v-if="categorizedSeasons.active.length > 0 || categorizedSeasons.upcoming.length > 0">
      <h2 class="mt-5 mb-2">Active & Upcoming</h2>

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

    <template v-if="categorizedSeasons.past.length > 0">
      <h2 class="mt-5 mb-2">Past Seasons</h2>
      <div class="seasons-container">
        <league-season-card v-for="season in categorizedSeasons.past" :key="season.id" :season="season" />
      </div>
    </template>

    <v-dialog v-model="showLeagueInfo" max-width="800">
      <v-card class="pa-5">
        More info here; also rules. WIP. Pls help
        <ul>
          <li>What is League</li>
          <li>What are Seasons</li>
          <li>How/When to join a Season</li>
          <li>How does the point system work</li>
          <li>How does the point system work</li>
          <li>How/When to join a game</li>
          <li>How to submit a run</li>
          <li>general rando rules (wiki?)</li>
        </ul>
      </v-card>
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
</style>
