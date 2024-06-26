<template>
  <v-tooltip bottom :disabled='isLoggedIn'>
    <template #activator='{on: onTooltip}'>
      <div v-on='onTooltip'>
        <v-menu offset-y :disabled='!isLoggedIn'>
          <template #activator='{on: onMenu}'>
            <v-btn depressed text :disabled='!isLoggedIn' v-bind='$attrs' v-on='onMenu'>
              <v-icon left>mdi-plus</v-icon>
              Manual game
            </v-btn>
          </template>
          <v-list :disabled='newGameLoading'>
            <v-list-item @click='createNewGame("normal")'>Normal</v-list-item>

            <v-menu
              v-for='bingoType in bingoTypes'
              :key='bingoType.type'
              offset-x
              :disabled='!isLoggedIn'
              :close-on-content-click='false'
            >
              <template #activator='{on: onNestedMenu}'>
                <v-list-item v-on='onNestedMenu'>{{ bingoType.label }}</v-list-item>
              </template>
              <v-card class='pa-4' min-width='500'>
                <v-slider
                  v-model="bingoSize"
                  :tick-labels='["1", "2", "3", "4", "5", "6", "7"]'
                  min="1"
                  max="7"
                  label="Board size"
                />
                <div class='d-flex'>
                  <v-spacer />
                  <v-btn
                    depressed
                    color='accent'
                    :loading='newGameLoading'
                    @click='createNewGame(bingoType.type)'
                  >Create</v-btn>
                </div>
              </v-card>
            </v-menu>

            <v-list-item v-if="$store.state.dev.devtoolsEnabled" @click='createNewGame("infection")'>Infection (WIP)</v-list-item>
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
      bingoSize: 5,
      bingoTypes: [
        {type: 'bingo', label: 'Bingo'},
        {type: 'discovery_bingo', label: 'Discovery Bingo'},
        {type: 'lockout_bingo', label: 'Lockout Bingo'},
      ],
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
                bingoConfig: {
                  size: this.bingoSize,
                },
              })
              break
            case 'discovery_bingo':
              multiverseId = await this.$axios.$post('/multiverses', {
                bingoConfig: {
                  discovery: 2,
                  size: this.bingoSize,
                },
              })
              break
            case 'lockout_bingo':
              multiverseId = await this.$axios.$post('/multiverses', {
                bingoConfig: {
                  lockout: true,
                  size: this.bingoSize,
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
