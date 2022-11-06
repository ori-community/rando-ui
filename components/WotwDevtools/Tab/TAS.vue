<template>
  <div class="pa-5">
    <template v-if="!randoIpcConnected"> Randomizer IPC not connected</template>
    <template v-else>
      <h1>TAS</h1>
      <div>Target FPS: {{ targetFps }}</div>
      <div>Frame: {{ currentFrame }}</div>
      <div>
        Real Mouse Position:

        <template v-if="realMousePositionUpdateActive">
          {{ realMousePosition.x.toFixed(3) }}, {{ realMousePosition.y.toFixed(3) }}
        </template>

        <v-btn x-small icon @click="realMousePositionUpdateActive = !realMousePositionUpdateActive">
          <v-icon v-if="realMousePositionUpdateActive">mdi-eye-off-outline</v-icon>
          <v-icon v-else>mdi-eye-outline</v-icon>
        </v-btn>
      </div>

      <div class="playback-controls">
        <v-tooltip open-delay="600" bottom>
          <template #activator="{on}">
            <v-btn icon v-on="on" @click="loadTimelineFromFile">
              <v-icon>mdi-file-refresh-outline</v-icon>
            </v-btn>
          </template>
          <span>Reload tas.json</span>
        </v-tooltip>

        <v-tooltip open-delay="600" bottom>
          <template #activator="{on}">
            <v-btn icon v-on="on" @click="rewindTimeline">
              <v-icon>mdi-skip-backward</v-icon>
            </v-btn>
          </template>
          <span>Rewind Timeline</span>
        </v-tooltip>

        <v-tooltip open-delay="600" bottom>
          <template #activator="{on}">
            <v-btn fab color="accent" large v-on="on" @click="framesteppingEnabled = !framesteppingEnabled">
              <v-icon v-if="!framesteppingEnabled" size="48">mdi-pause</v-icon>
              <v-icon v-else size="48">mdi-play</v-icon>
            </v-btn>
          </template>
          <span>{{ framesteppingEnabled ? 'Resume' : 'Pause' }} game</span>
        </v-tooltip>

        <v-tooltip open-delay="600" bottom>
          <template #activator="{ on }">
            <v-btn icon v-on="on" @click="timelinePlaybackActive = !timelinePlaybackActive">
              <v-icon v-if="timelinePlaybackActive" color="green accent-3">mdi-movie-open-play</v-icon>
              <v-icon v-else color="red">mdi-movie-open-off-outline</v-icon>
            </v-btn>
          </template>
          <span>Timeline playback {{ timelinePlaybackActive ? 'disabled' : 'enabled' }}</span>
        </v-tooltip>

        <v-tooltip open-delay="600" bottom>
          <template #activator="{ on }">
            <v-btn :disabled="!framesteppingEnabled" icon v-on="on" @click="framestep">
              <v-icon>mdi-step-forward</v-icon>
            </v-btn>
          </template>
          <span>Next Frame</span>
        </v-tooltip>
      </div>
    </template>
  </div>
</template>

<script>
  import { mapState } from 'vuex'

  export default {
    data: () => ({
      updateRealMousePositionIntervalId: null,
      targetFps: 60,
      currentFrame: 0,
      realMousePositionUpdateActive: false,
      realMousePosition: {
        x: 0,
        y: 0,
      },
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
      realMousePositionUpdateActive(value) {
        if (this.updateRealMousePositionIntervalId !== null) {
          clearInterval(this.updateRealMousePositionIntervalId)
          this.updateRealMousePositionIntervalId = null
        }

        if (value) {
          this.updateRealMousePositionIntervalId = setInterval(() => {
            if (this.randoIpcConnected) {
              this.updateRealMousePosition()
            }
          }, 100)
        }
      },
    },
    mounted() {
      window.electronApi.on('tas.currentFrameChanged', (event, { frame }) => {
        this.currentFrame = frame
      })

      window.electronApi.on('tas.timelineLoaded', () => {
        this.updateState()
      })
    },
    beforeDestroy() {
      if (this.updateRealMousePositionIntervalId !== null) {
        clearInterval(this.updateRealMousePositionIntervalId)
        this.updateRealMousePositionIntervalId = null
      }
    },
    methods: {
      async updateRealMousePosition() {
        const { x, y } = await window.electronApi.invoke('tas.getRealMousePosition')
        this.realMousePosition.x = x
        this.realMousePosition.y = y
      },
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
  .playback-controls {
    display: flex;
    gap: 1em;
    align-items: center;
    justify-content: center;
  }
</style>
