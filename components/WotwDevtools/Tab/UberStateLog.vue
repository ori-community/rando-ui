<template>
  <div class="pa-5">
    <template v-if="!randoIpcConnected"> Randomizer IPC not connected </template>
    <template v-else>
      <div class="tables-container">
        <div>
          <v-card>
            <h3 class="text-center pt-3 mb-5">Changes</h3>
            <div class="d-flex pa-2 board-buttons">
              <v-btn text @click="changes = []">
                <v-icon left>mdi-delete-outline</v-icon>
                Clear
              </v-btn>
              <v-spacer />
              <v-checkbox v-model="ignoreGroup3" dense hide-labe="true" label="Ignore Group 3" />
            </div>
            <v-data-table :items="changes" :headers="headersChanges" dense>
              <template v-slot:item.actions="{ item }">
                <v-icon class="me-1" small @click="addToWatchlist(item.group, item.state)"> mdi-eye-outline </v-icon>
                <v-icon small @click="copyToClipboard(item)"> mdi-content-copy </v-icon>
              </template>
            </v-data-table>
          </v-card>
        </div>
        <div>
          <v-card>
            <h3 class="text-center pt-3 mb-5">Watchlist</h3>
            <div class="pa-2 board-buttons">
              <v-btn text icon @click="showAddToWatchlistDialog = true">
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </div>
            <v-data-table :items="watchlist" :headers="headersWatchlist" dense>
              <template v-slot:item.actions="{ item }">
                <v-icon class="me-1" small @click="removeFromWatchlist(item)"> mdi-delete </v-icon>
                <v-icon small @click="copyToClipboard(item)"> mdi-content-copy </v-icon>
              </template>
            </v-data-table>
          </v-card>
        </div>
      </div>
    </template>
    <v-dialog v-model="showAddToWatchlistDialog" max-width="300">
      <v-card class="pa-5">
        <div class="add-to-watchlist-inputs">
          <v-text-field v-model="addToWatchlistObjectGroup" label="Group" type="number" autofocus> </v-text-field>
          <v-text-field v-model="addToWatchlistObjectState" label="State" type="number"> </v-text-field>
        </div>
        <div class="text-right">
          <v-btn
            :disabled="!(addToWatchlistObjectGroup >= 0) || !(addToWatchlistObjectState >= 0)"
            color="accent"
            @click="
              addToWatchlist(addToWatchlistObjectGroup, addToWatchlistObjectState), (showAddToWatchlistDialog = false)
            "
            >Add</v-btn
          >
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import { EventBus } from '~/assets/lib/EventBus'

  export default {
    data: () => ({
      ignoreGroup3: true,
      changes: [],
      watchlist: [],
      headersChanges: [
        { text: 'Group', value: 'group', align: 'left' },
        { text: 'State', value: 'state', align: 'left' },
        { text: 'Prev. Value', value: 'previousValue', align: 'left' },
        { text: 'Value', value: 'value', align: 'left' },
        { text: 'Actions', value: 'actions' },
      ],
      headersWatchlist: [
        { text: 'Group', value: 'group', align: 'left' },
        { text: 'State', value: 'state', align: 'left' },
        { text: 'Prev. Value', value: 'previousValue', align: 'left' },
        { text: 'Value', value: 'value', align: 'left' },
        { text: 'Actions', value: 'actions' },
      ],
      showAddToWatchlistDialog: false,
      addToWatchlistObjectGroup: '',
      addToWatchlistObjectState: '',
    }),
    computed: {
      ...mapState('electron', ['randoIpcConnected']),
    },
    mounted() {
      window.electronApi.invoke('devtools.enableSendingAllUberStateUpdates')

      window.electronApi.on('game.uberStateChanged', (_event, change) => {
        if (this.ignoreGroup3 && change.group === 3) {
          return
        }

        const indexOfWatched = this.watchlist.findIndex(
          (uberstate) => uberstate.group === change.group && uberstate.state === change.state,
        )
        if (indexOfWatched !== -1) {
          this.$set(this.watchlist, indexOfWatched, change)
        }
        this.changes.unshift(change)
      })
    },
    beforeDestroy() {
      window.electronApi.invoke('devtools.disableSendingAllUberStateUpdates')
    },
    methods: {
      async addToWatchlist(group, state) {
        group = Number(group)
        state = Number(state)
        if (isNaN(group) || isNaN(state)) {
          console.error('group or state not set')
          EventBus.$emit('notification', {
            message: `parsing error for uberstate ${group}|${state}`,
            color: 'error',
          })
          return
        }
        if (!this.watchlist.some((uberstate) => uberstate.group === group && uberstate.state === state)) {
          const value = await window.electronApi.invoke('uberState.get', { group, state })
          this.watchlist.push({ group, state, value })
        }
      },
      removeFromWatchlist(item) {
        const index = this.watchlist.findIndex(
          (uberstate) => uberstate.group === item.group && uberstate.state === item.state,
        )
        if (index !== -1) {
          this.watchlist.splice(index, 1)
        }
      },
      async copyToClipboard(uberstate) {
        await window.navigator.clipboard.writeText(
          `${uberstate.group}|${uberstate.state}${uberstate.value ? `=${uberstate.value}` : ''}`,
        )
        console.log('copied')
        EventBus.$emit('notification', {
          message: `Copied to clipboard`,
          color: 'success darken-3',
          timeout: 1000,
        })
      },
    },
  }
</script>

<style lang="scss" scoped>
  .tables-container {
    display: grid;
    align-items: start;
    grid-template-columns: 1fr 1fr;
    grid-auto-flow: column;
    gap: 1em;

    @media (max-width: 800px) {
      grid-template-columns: 1fr;
      grid-auto-flow: row;
    }
  }

  .board-buttons {
    position: absolute;
    top: 0;
    width: 100%;
  }

  .add-to-watchlist-inputs {
    display: flex;
    gap: 1em;
  }
</style>
