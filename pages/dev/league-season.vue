<template>
  <v-container>
    <h2>Create League Season</h2>

    <v-row>
      <v-col cols="4">
        <v-text-field v-model="name" label="Name" />
      </v-col>
      <v-col cols="4">
        <v-text-field v-model="cron" label="Cron" />
      </v-col>
      <v-col cols="4">
        <v-text-field v-model="gameCount" type="number" label="Game count" />
      </v-col>
    </v-row>

    <v-btn color="accent" @click="create">
      Create Season
    </v-btn>
  </v-container>
</template>

<script>
  export default {
    data: () => ({
      name: 'My League Season',
      cron: '*/10 * * * *',
      gameCount: 3,
    }),
    methods: {
      async create() {
        try {
          const seasonId = await this.$axios.$post('/dev/league/season', {
            name: this.name,
            cron: this.cron,
            gameCount: this.gameCount,
          })

          await this.$router.push({name: 'league-seasons-seasonId', params: {seasonId}})
        } catch (e) {
          console.error(e)
        }
      },
    }
  }
</script>

<style scoped>

</style>
