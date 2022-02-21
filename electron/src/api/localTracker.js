import { LocalTrackerWebSocketService } from '~/electron/src/lib/LocalTrackerWebSocketService'
import { LocalTrackerService } from '@/lib/LocalTrackerService'

export default {
  isTrackerRunning() {
    return LocalTrackerWebSocketService.isRunning
  },
  getPort() {
    return LocalTrackerWebSocketService.port
  },
  async openWindow() {
    await LocalTrackerService.openLocalTracker()
  },
  debugSetUberState(event, { trackingId, value }) {
    LocalTrackerWebSocketService.debugSetUberState(trackingId, value)
  },
  async expose(event, { baseUrl, jwt }) {
    return await LocalTrackerWebSocketService.expose(baseUrl, jwt)
  },
  getEndpoint() {
    return LocalTrackerWebSocketService.remoteTrackerEndpoint
  },
}
