<template>
  <v-container>
    <div class="mb-6">
      <h2>Create League Season</h2>

      <v-row>
        <v-col cols="4">
          <v-text-field v-model="createName" label="Name" />
        </v-col>
        <v-col cols="4">
          <v-text-field v-model="createCron" label="Cron" />
        </v-col>
        <v-col cols="4">
          <v-text-field v-model="createGameCount" type="number" label="Game count" />
        </v-col>
        <v-col cols="12">
          <v-text-field v-model="createShortDescription" label="Short Description" />
        </v-col>
        <v-col cols="12">
          <v-textarea v-model="createLongDescriptionMarkdown" auto-grow label="Long Description (Markdown)" />
        </v-col>
        <v-col cols="12">
          <v-textarea v-model="createRulesMarkdown" auto-grow label="Rules (Markdown)" />
        </v-col>
        <v-col cols="12">
          <v-text-field v-model="createBackgroundImageUrl" label="Background Image URL (optional)" />
        </v-col>
      </v-row>

      <v-btn color="accent" @click="create">
        Create Season
      </v-btn>
    </div>
    <div class="mb-6">
      <h2>Force Continue League Season</h2>

      <v-row>
        <v-col cols="12">
          <v-text-field v-model="seasonId" type="number" label="Season ID" />
        </v-col>
      </v-row>

      <v-btn class="mr-1" color="accent" @click="forceContinue">
        Force Continue
      </v-btn>
      <v-btn color="accent" @click="recalculateSingleLeaderboard">
        Recalculate Leaderboard
      </v-btn>
    </div>
    <div class="mb-6">
      <h2>Recalculate all Leaderboards</h2>

      <v-btn color="accent" @click="recalculateLeaderboards">
        Recalculate
      </v-btn>
    </div>
  </v-container>
</template>

<script>
  export default {
    data: () => ({
      createName: 'My League Season',
      createCron: '*/10 * * * *',
      createGameCount: 3,
      createShortDescription: 'Test League, Gorlek, All Trees',
      createLongDescriptionMarkdown: 'Welcome to the *Test League*.\nWhat you can expect here:\n- Fun\n- Bugs\n- even more Fun',
      createRulesMarkdown: '1. Do not cheat\n2. If you do, uninstall the game immediately',
      createBackgroundImageUrl: '',
      seasonId: 0,
    }),
    methods: {
      async create() {
        try {
          const seasonId = await this.$axios.$post('/dev/league/season', {
            name: this.createName,
            cron: this.createCron,
            gameCount: this.createGameCount,
            shortDescription: this.createShortDescription,
            longDescriptionMarkdown: this.createLongDescriptionMarkdown,
            rulesMarkdown: this.createRulesMarkdown,
            backgroundImageUrl: this.createBackgroundImageUrl,
          })

          await this.$router.push({name: 'league-seasons-seasonId', params: {seasonId}})
        } catch (e) {
          alert(e)
          console.error(e)
        }
      },
      async forceContinue() {
        try {
          await this.$axios.$post(`/dev/league/season/${this.seasonId}/continue`)
          alert("Successfully continued season")
        } catch (e) {
          alert(e)
          console.error(e)
        }
      },
      async recalculateSingleLeaderboard() {
        try {
          await this.$axios.$post(`/dev/league/season/${this.seasonId}/recalculate-points`)
          alert("Successfully recalculated leaderboard")
        } catch (e) {
          alert(e)
          console.error(e)
        }
      },
      async recalculateLeaderboards() {
        try {
          await this.$axios.$post(`/dev/league/season/recalculate-points`)
          alert("Successfully recalculated all leaderboards")
        } catch (e) {
          alert(e)
          console.error(e)
        }
      },
    }
  }
</script>

<style scoped>

</style>
