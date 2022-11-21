<template>
  <div class="pa-5">
    <template v-if="!randoIpcConnected"> Randomizer IPC not connected</template>
    <template v-else>
      <h1>TAS</h1>
      <div>Target FPS: {{ targetFps }}</div>
      <div>Frame: {{ currentFrame === 0 ? '-' : currentFrame }}</div>
      <div>Real Mouse Position (UI Space): {{ realMousePosition.x.toFixed(3) }}, {{ realMousePosition.y.toFixed(3) }}</div>
      <div>Ori Position: {{ oriPosition.x.toFixed(3) }}, {{ oriPosition.y.toFixed(3) }}</div>
      <div>Loading state: {{ loadingState }}</div>
      <div>RNG State: {{ rngState }}</div>

      <div class="playback-controls">
        <v-tooltip open-delay="600" bottom>
          <template #activator="{ on }">
            <v-btn icon v-on="on" @click="loadTimelineFromFile">
              <v-icon>mdi-file-refresh-outline</v-icon>
            </v-btn>
          </template>
          <span>Reload tas.json</span>
        </v-tooltip>

        <v-tooltip open-delay="600" bottom>
          <template #activator="{ on }">
            <v-btn icon v-on="on" @click="rewindTimeline">
              <v-icon>mdi-skip-backward</v-icon>
            </v-btn>
          </template>
          <span>Rewind Timeline</span>
        </v-tooltip>

        <v-tooltip open-delay="600" bottom>
          <template #activator="{ on }">
            <v-btn fab color="accent" large v-on="on" @click="setFramesteppingEnabled(!framesteppingEnabled)">
              <v-icon v-if="!framesteppingEnabled" size="48">mdi-pause</v-icon>
              <v-icon v-else size="48">mdi-play</v-icon>
            </v-btn>
          </template>
          <span>{{ framesteppingEnabled ? 'Resume' : 'Pause' }} game</span>
        </v-tooltip>

        <v-tooltip open-delay="600" bottom>
          <template #activator="{ on }">
            <v-btn icon v-on="on" @click="setTimelinePlaybackActive(!timelinePlaybackActive)">
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

      <wotw-tas-timeline v-model="timeline" :frame.sync="currentFrame" />
    </template>
  </div>
</template>

<script>
  import { mapState } from 'vuex'

  export default {
    data: () => ({
      targetFps: 60,
      currentFrame: 0,
      rngState: 0,
      realMousePosition: {
        x: 0,
        y: 0,
      },
      framesteppingEnabled: false,
      timelinePlaybackActive: false,
      loadingState: 'NotLoading',
      oriPosition: {
        x: 0,
        y: 0,
      },
      timeline: [],
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
    },
    mounted() {
      window.electronApi.on('tas.stateChanged', (event, { state }) => {
        this.onStateChanged(state);
      })

      window.electronApi.on('tas.timelineLoaded', (event, {tasConfig}) => {
        this.timeline = tasConfig?.timeline ?? []
        this.updateState()
      })
    },
    methods: {
      onStateChanged(state) {
        this.framesteppingEnabled = state.framestepping_enabled
        this.timelinePlaybackActive = state.timeline_playback_active
        this.currentFrame = state.timeline_current_frame
        this.rngState = state.timeline_current_rng_state
        this.targetFps = state.timeline_fps
        this.loadingState = state.loading_state
        this.oriPosition = state.ori_position
        this.realMousePosition = state.real_mouse_position
      },
      async updateState() {
        const state = await window.electronApi.invoke('tas.getState')
        this.onStateChanged(state)
      },
      setFramesteppingEnabled(enabled) {
        window.electronApi.invoke('tas.setFramesteppingEnabled', { enabled })
      },
      setTimelinePlaybackActive(active) {
        window.electronApi.invoke('tas.setTimelinePlaybackActive', { active });
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
