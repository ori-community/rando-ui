<template>
  <div class="pa-5">
    <template v-if="!randoIpcConnected"> Randomizer IPC not connected </template>
    <template v-else>
      <h1>TAS</h1>
      <v-checkbox v-model="framesteppingEnabled" label="Enable Framestepping" />
      <v-checkbox v-model="timelinePlaybackActive" label="Timeline Playback" />
      <v-btn color="accent" @click="framestep">Next frame</v-btn>
      <v-btn color="accent" @click="rewindTimeline">Rewind</v-btn>
    </template>
  </div>
</template>

<script>
  import { mapState } from 'vuex'

  export default {
    data: () => ({
      framesteppingEnabled: false,
      timelinePlaybackActive: false,
    }),
    computed: {
      ...mapState('electron', ['randoIpcConnected']),
    },
    watch: {
      framesteppingEnabled(value) {
        window.electronApi.invoke('tas.setFramesteppingEnabled', { enabled: value })
      },
      timelinePlaybackActive(value) {
        window.electronApi.invoke('tas.setTimelinePlaybackActive', { active: value })
      },
    },
    methods: {
      framestep() {
        window.electronApi.invoke('tas.framestep')
      },
      rewindTimeline() {
        window.electronApi.invoke('tas.rewindTimeline')
      },
    },
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
</style>
