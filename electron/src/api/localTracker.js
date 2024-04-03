import { LocalTrackerWebSocketService } from '~/electron/src/lib/LocalTrackerWebSocketService'
import { LocalTrackerService } from '@/lib/LocalTrackerService'
import {SettingsService} from '@/lib/SettingsService'

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
  getEndpointId() {
    return LocalTrackerWebSocketService.remoteTrackerEndpointId
  },
  async resetWindowRect() {
    const rect = LocalTrackerService.getInitialWindowRect()
    await SettingsService.setSetting('LocalTracker.X', rect.x)
    await SettingsService.setSetting('LocalTracker.Y', rect.y)
    await SettingsService.setSetting('LocalTracker.Width', rect.width)
    await SettingsService.setSetting('LocalTracker.Height', rect.height)

    LocalTrackerService.resetWindowRect()
  }
}
