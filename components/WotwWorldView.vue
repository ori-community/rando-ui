<template>
  <v-card class='world-view' outlined color='background lighten-2'>
    <v-card-title>{{ world.name }}</v-card-title>
    <v-card-text>
      <wotw-player-view v-for='player in world.members' :key='player.id' class='mb-1' :user='player' :multiverse-id='multiverseId' />
    </v-card-text>
    <div class='spacer'></div>
    <v-btn v-if='canJoinInternal' :disabled='disabled' block color='accent' tile @click='$emit("join")'>
      Join
    </v-btn>
  </v-card>
</template>

<script>
  import { mapState } from 'vuex'

  export default {
    name: 'WotwWorldView',
    props: {
      world: {
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
      },
      multiverseId: {
        type: Number,
        required: false,
        default: null,
      }
    },
    computed: {
      ...mapState('user', ['user']),
      canJoinInternal() {
        return this.canJoin && !this.world.members.some(u => u.id === this.user?.id)
      },
    },
  }
</script>

<style lang='scss' scoped>
  .world-view {
    min-width: 15vw;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .spacer {
      flex-basis: 100%;
    }
  }
</style>
