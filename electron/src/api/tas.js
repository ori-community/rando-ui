import { RandoIPCService } from '~/electron/src/lib/RandoIPCService'

export default {
  async setFramesteppingEnabled(event, { enabled }) {
    await RandoIPCService.emit('tas.set_framestepping_enabled', { enabled })
  },
  async framestep() {
    await RandoIPCService.emit('tas.framestep')
  },
  async setTimelinePlaybackActive(event, { active }) {
    await RandoIPCService.emit('tas.set_timeline_playback_active', { active })
  },
  async rewindTimeline() {
    await RandoIPCService.emit('tas.rewind_timeline')
  },
}
