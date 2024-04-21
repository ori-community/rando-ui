<template>
  <div class="pa-5">
    <template v-if="!randoIpcConnected"> Randomizer IPC not connected </template>
    <template v-else>
      <v-data-table :items="changes" :headers="headers" dense />

      <div class="mt-4 d-flex">
        <v-btn text @click="changes = []">
          <v-icon left>mdi-delete-outline</v-icon>
          Clear
        </v-btn>
        <v-spacer />
        <v-checkbox v-model="ignoreGroup3" dense label="Ignore Group 3" />
      </div>
    </template>
  </div>
</template>

<script>
  import { mapState } from 'vuex'

  export default {
    data: () => ({
      ignoreGroup3: true,
      changes: [],
      headers: [
        { text: 'Group', value: 'group', align: 'left' },
        { text: 'State', value: 'state', align: 'left' },
        { text: 'Prev. Value', value: 'previousValue', align: 'left' },
        { text: 'Value', value: 'value', align: 'left' },
      ],
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

        this.changes.unshift(change)
      })
    },
    beforeDestroy() {
      window.electronApi.invoke('devtools.disableSendingAllUberStateUpdates')
    }
  }
</script>

<style lang="scss" scoped>
  .tree-item {
    cursor: pointer;

    .not-loaded {
      opacity: 0.5;
    }
  }

  .sticky {
    position: sticky;
    top: 1em;
  }

  .disabled {
    opacity: 0.5;
  }
</style>
