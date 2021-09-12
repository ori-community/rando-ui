<template>
  <v-card class='team-view'>
    <v-sheet :color='color' height='0.5em' />
    <v-card-title>{{ team.name }}</v-card-title>
    <v-card-text>
      <wotw-player-view v-for='player in team.members' :key='player.id' class='mb-1' :user='player' />
    </v-card-text>
    <v-btn v-if='canJoinInternal' :disabled='disabled' block color='accent' tile @click='$emit("join")'>
      Join
    </v-btn>
  </v-card>
</template>

<script>
  import { mapState } from 'vuex'

  export default {
    name: 'WotwTeamView',
    props: {
      team: {
        type: Object,
        required: true,
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      color: {
        type: String,
        default: '',
      },
      canJoin: {
        type: Boolean,
        default: true,
      }
    },
    computed: {
      ...mapState('user', ['user']),
      canJoinInternal() {
        return this.canJoin && !this.team.members.some(u => u.id === this.user?.id)
      },
    },
  }
</script>

<style lang='scss' scoped>
  .team-view {
    min-width: 15vw;
    overflow: hidden;
  }
</style>
