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
      </v-row>

      <v-btn color="accent" @click="create">
        Create Season
      </v-btn>
    </div>
    <div class="mb-6">
      <h2>Force Continue League Season</h2>

      <v-row>
        <v-col cols="12">
          <v-text-field v-model="forceContinueId" type="number" label="Season ID" />
        </v-col>
      </v-row>

      <v-btn color="accent" @click="forceContinue">
        Force Continue
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
      forceContinueId: 0,
    }),
    methods: {
      async create() {
        try {
          const seasonId = await this.$axios.$post('/dev/league/season', {
            name: this.createName,
            cron: this.createCron,
            gameCount: this.createGameCount,
          })

          await this.$router.push({name: 'league-seasons-seasonId', params: {seasonId}})
        } catch (e) {
          alert(e)
          console.error(e)
        }
      },
      async forceContinue() {
        try {
          await this.$axios.$post(`/dev/league/season/${this.forceContinueId}/continue`)
          alert("Successfully continued season")
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
