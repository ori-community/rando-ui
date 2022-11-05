<template>
  <div class="pa-5">
    <template v-if="!randoIpcConnected"> Randomizer IPC not connected</template>
    <template v-else>
      <h1>TAS</h1>
      <div>Target FPS: {{ targetFps }}</div>
      <div>Frame: {{ currentFrame }}</div>
      <v-checkbox v-model="framesteppingEnabled" label="Enable Framestepping" hide-details />
      <v-checkbox v-model="timelinePlaybackActive" label="Timeline Playback" />
      <v-btn color="accent" @click="loadTimelineFromFile">Load tas.json</v-btn>
      <v-btn color="accent" @click="framestep">Next frame</v-btn>
      <v-btn color="accent" @click="rewindTimeline">Rewind</v-btn>
    </template>
  </div>
</template>

<script>
  import { mapState } from 'vuex'

  export default {
    data: () => ({
      targetFps: 60,
      currentFrame: 0,
      framesteppingEnabled: false,
      timelinePlaybackActive: false,
    }),
    computed: {
      ...mapState('electron', ['randoIpcConnected']),
    },
    watch: {
      randoIpcConnected: {
        immediate: true,
        handler(connected) {
          if (connected) {
            this.updateState()
          }
        },
      },
      framesteppingEnabled(value) {
        window.electronApi.invoke('tas.setFramesteppingEnabled', { enabled: value })
      },
      timelinePlaybackActive(value) {
        window.electronApi.invoke('tas.setTimelinePlaybackActive', { active: value })
      },
    },
    mounted() {
      window.electronApi.on('tas.currentFrameChanged', (event, {frame}) => {
        this.currentFrame = frame
      })

      window.electronApi.on('tas.timelineLoaded', () => {
        this.updateState()
      })
    },
    methods: {
      async updateState() {
        const state = await window.electronApi.invoke('tas.getState')

        this.framesteppingEnabled = state.framestepping_enabled
        this.timelinePlaybackActive = state.timeline_playback_active
        this.currentFrame = state.timeline_current_frame
        this.targetFps = state.timeline_fps
      },
      loadTimelineFromFile() {
        window.electronApi.invoke('tas.loadTimelineFromFile')
      },
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
