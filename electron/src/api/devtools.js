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
}
