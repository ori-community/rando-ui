import { RandoIPCService } from '~/electron/src/lib/RandoIPCService'

export default {
  async get_timer_stats() {
    return await RandoIPCService.request("timer.get_stats")
  },
  async get_pickup_counts() {
    return await RandoIPCService.request("get_pickup_counts")
  },
}
