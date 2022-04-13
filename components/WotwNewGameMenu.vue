<template>
  <v-tooltip bottom :disabled='isLoggedIn'>
    <template #activator='{on: onTooltip}'>
      <div style='display:inline' v-on='onTooltip'>
        <v-menu offset-y :disabled='!isLoggedIn'>
          <template #activator='{on: onMenu}'>
            <v-btn depressed text :disabled='!isLoggedIn' v-bind='$attrs' v-on='onMenu'>
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
      </div>
    </template>
    <span>Log in to create online games</span>
  </v-tooltip>
</template>

<script>
  import { mapGetters } from 'vuex'

  export default {
    name: 'WotwNewGameMenu',
    data: () => ({
      newGameLoading: false,
    }),
    computed: {
      ...mapGetters('user', ['isLoggedIn']),
    },
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
              multiverseId = await this.$axios.$post('/multiverses', {
                bingo: {},
              })
              break
            case 'discovery_bingo':
              multiverseId = await this.$axios.$post('/multiverses', {
                bingo: {
                  discovery: 2,
                },
              })
              break
            case 'lockout_bingo':
              multiverseId = await this.$axios.$post('/multiverses', {
                bingo: {
                  lockout: true,
                },
              })
              break
            default:
              throw new Error(`Invalid game type: ${type}`)
          }

          await this.$router.push({ name: 'game-multiverseId', params: { multiverseId } })
        } catch (e) {
          console.error(e)
        }

        this.newGameLoading = false
      },
    },
  }
</script>

<style scoped>

</style>
