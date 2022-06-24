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
    await SettingsService.transaction(settings => {
      const rect = LocalTrackerService.getInitialWindowRect()
      settings['LocalTracker.X'] = rect.x
      settings['LocalTracker.Y'] = rect.y
      settings['LocalTracker.Width'] = rect.width
      settings['LocalTracker.Height'] = rect.height
      return settings
    })

    LocalTrackerService.resetWindowRect()
  }
}
