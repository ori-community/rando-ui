import { RandoIPCService } from '~/electron/src/lib/RandoIPCService'

export default {
  async get(event, { group, state }) {
    const value = await RandoIPCService.getUberState(group, state)
    return value
  },
  async getMultiple(event, states) {
    return await RandoIPCService.getUberStates(states)
  },
  async set(event, { group, state, value }) {
    await RandoIPCService.setUberState(group, state, value)
    return value
  },
}
