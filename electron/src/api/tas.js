import { RandoIPCService } from '~/electron/src/lib/RandoIPCService'

export default {
  async getRealMousePosition() {
    return await RandoIPCService.request('tas.get_real_mouse_position')
  },
  async getState() {
    return await RandoIPCService.request('tas.get_state')
  },
  async loadTimelineFromFile() {
    await RandoIPCService.emit('tas.load_timeline_from_file')
  },
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
