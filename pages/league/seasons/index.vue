<template>
  <v-container>
    <h1>Randomizer League</h1>

    {{ leagueSeasons }}
  </v-container>
</template>

<script>
  export default {
    data: () => ({
      seasonsLoading: false,
      leagueSeasons: [],
    }),
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
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
