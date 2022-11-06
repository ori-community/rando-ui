import { DevToolsWindowService } from '~/electron/src/lib/DevToolsWindowService'
import { RandoIPCService } from '@/lib/RandoIPCService'

export default {
  async open() {
    await DevToolsWindowService.open()
  },

  async getGameObject(event, path, instanceId) {
    return await RandoIPCService.request('get_game_object', { path, instance_id: instanceId })
  },

  async getGameObjectChildren(event, path, instanceId) {
    return await RandoIPCService.request('get_children', { path, instance_id: instanceId })
  },

  async setGameObjectActive(event, path, instanceId, active) {
    return await RandoIPCService.emit('set_game_object_active', { path, instance_id: instanceId, value: active })
  },
}
