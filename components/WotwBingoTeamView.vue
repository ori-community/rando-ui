<template>
  <v-card class='team-view' @click='$emit("click")'>
    <v-sheet :color='color' class='color-stripe'>
      <div v-if='!!bingoTeam' class='squares px-2'>
        {{ bingoTeam.squares }}
      </div>
    </v-sheet>
    <div v-if='!!team' class='pa-2 players'>
      <wotw-player-view
        v-for='player in team.members'
        :key='player.id'
        class='player-view'
        :user='player'
        :size='24'
      />
    </div>
    <v-spacer />
    <div v-if='!!bingoTeam' class='lines px-3'>
      <v-icon size='16'>mdi-vector-line</v-icon>
      {{ bingoTeam.lines }}
    </div>
  </v-card>
</template>

<script>
  import { mapState } from 'vuex'

  export default {
    name: 'WotwBingoTeamView',
    props: {
      team: {
        type: Object,
        required: true,
      },
      bingoTeam: {
        type: Object,
        default: null,
      },
      color: {
        type: String,
        default: '',
      },
    },
    computed: {
      ...mapState('user', ['user']),
    },
  }
</script>

<style lang='scss' scoped>
  .team-view {
    overflow: hidden;
    display: flex;
    flex-direction: row;
    position: relative;

    .color-stripe {
      border-radius: 0 !important;
      position: relative;
      flex-shrink: 0;

      .squares {
        width: 2.5em;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        font-size: 1.75em;
        font-weight: bold;
        transform: translateY(0.05em);
      }
    }

    .with-gap {
      gap: 0.75em;
    }

    .players {
      display: flex;
      flex-direction: column;
      gap: 0.2em;
      justify-content: center;
    }

    .lines {
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 0.3em;
    }
  }
</style>
