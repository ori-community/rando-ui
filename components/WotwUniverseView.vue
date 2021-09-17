<template>
  <v-card class='universe-view'>
    <v-sheet :color='color' height='0.5em' />
    <v-card-title>{{ universe.name }}</v-card-title>
    <v-card-text class='d-flex worlds'>
      <wotw-world-view
        v-for='world in universe.worlds'
        :key='world.id'
        :world='world'
        :disabled='disabled'
        :can-join='canJoin'
        @join='$emit("join-world", world.id)'
      />
    </v-card-text>
    <v-btn v-if='canJoin' :disabled='disabled' block color='accent' tile @click='$emit("new-world")'>
      New World
    </v-btn>
  </v-card>
</template>

<script>
  import { mapState } from 'vuex'

  export default {
    name: 'WotwUniverseView',
    props: {
      universe: {
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
    },
  }
</script>

<style lang='scss' scoped>
  .universe-view {
    min-width: 15vw;
    overflow: hidden;
  }

  .worlds {
    gap: 1em;
  }
</style>
