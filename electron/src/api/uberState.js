import { RandoIPCService } from '~/electron/src/lib/RandoIPCService'

export default {
  async get(event, { group, state }) {
    const value = await RandoIPCService.getUberState(group, state)
    console.log(value)
    return value
  },
  async getMultiple(event, states) {
    console.log(states)
    return await RandoIPCService.getUberStates(states)
  },
}
