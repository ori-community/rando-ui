<template>
  <v-container>
    <h1 class='text-center mt-12 mb-6'>Randomizer League</h1>
    <div class="mb-3">
      Small league introduction</br>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit,
      sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
      Cursus mattis molestie a iaculis. Viverra justo nec ultrices dui.
      Sagittis purus sit amet volutpat consequat mauris nunc.
      Nulla aliquet enim tortor at auctor. Nibh tellus molestie nunc non.
      Libero enim sed faucibus turpis. Eget arcu dictum varius duis at
      consectetur lorem donec massa. Cursus vitae congue mauris rhoncus
      aenean vel elit. Elementum pulvinar etiam non quam lacus suspendisse
      faucibus interdum. Vitae congue mauris rhoncus aenean vel elit scelerisque mauris.
      Mi proin sed libero enim. Etiam non quam lacus suspendisse faucibus interdum
      posuere lorem ipsum. Auctor elit sed vulputate mi sit.
    </div>
    <v-btn small text outlined @click="showLeagueInfo = true"><v-icon left>mdi-information-outline</v-icon>More Info</v-btn>
    <v-card class="mt-5 pa-3">
      <div v-for="season in sortedSeasons" :key="season.id">
        <v-btn :color='season.currentGameId == null ? "" : "accent"'
          :to="{ name: 'league-seasons-seasonId', params: { seasonId: season.id } }">{{ season.id }} / {{ season.name
          }}</v-btn>
      </div>
    </v-card>
    <!-- <pre>{{ leagueSeasons }}</pre> -->

    <v-dialog v-model="showLeagueInfo" max-width="800">
      <v-card class="pa-5">
        More info here.
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>

  // TODO:
  // league description
  // general league ruleset
  // grid view for list of leagues (Name, short description, scheduled start, current game / game count, amount of members)
  // mark season if: you joined it, its active
  // update list by seasons change (for example new season added, season ended, member joined)

export default {
  data: () => ({
    seasonsLoading: false,
    leagueSeasons: [],
    showLeagueInfo: false,
  }),
  mounted() {
    this.loadSeasons()
  },
  computed: {
    sortedSeasons() {
      return [...this.leagueSeasons].sort((a, b) => (b.id) - (a.id))
    },
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
    }
  }
}
</script>

<style lang="scss" scoped></style>
