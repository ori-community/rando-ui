<template>
  <v-menu offset-y>
    <template #activator='{on}'>
      <v-btn depressed text v-bind='$attrs' v-on='on'>
        <v-icon left>mdi-plus</v-icon>
        New game
      </v-btn>
    </template>
    <v-list>
      <v-list-item @click='createNewGame("normal")'>Normal</v-list-item>
      <v-list-item @click='createNewGame("bingo")'>Bingo</v-list-item>
      <v-list-item @click='createNewGame("discovery_bingo")'>Discovery Bingo</v-list-item>
      <v-list-item @click='createNewGame("lockout_bingo")'>Lockout Bingo</v-list-item>
    </v-list>
  </v-menu>
</template>

<script>

  export default {
    name: 'WotwNewGameMenu',
    data: () => ({
      newGameLoading: false,
    }),
    methods: {
      async createNewGame(type) {
        if (this.newGameLoading) {
          return
        }

        this.newGameLoading = true

        try {
          let multiverseId

          switch (type) {
            case 'normal':
              multiverseId = await this.$axios.$post('/multiverses')
              break
            case 'bingo':
              multiverseId = await this.$axios.$post('/bingo')
              break
            case 'discovery_bingo':
              multiverseId = await this.$axios.$post('/bingo', {discovery: 2})
              break
            case 'lockout_bingo':
              multiverseId = await this.$axios.$post('/bingo', {lockout: true})
              break
            default:
              throw new Error(`Invalid game type: ${type}`)
          }

          await this.$router.push({name: 'game-multiverseId', params: {multiverseId}})
        } catch (e) {
          console.error(e)
        }

        this.newGameLoading = false
      }
    }
  }
</script>

<style scoped>

</style>
