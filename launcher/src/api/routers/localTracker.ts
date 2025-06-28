import {publicProcedure, router} from "@launcher/api/trpc"
import {observable} from "@trpc/server/observable"
import {LocalTrackerWebSocketService} from "@launcher/services/LocalTrackerWebSocketService"
import {LocalTrackerService} from "@launcher/services/LocalTrackerService"
import {SettingsService} from "@launcher/services/SettingsService"

export const localTracker = router({
  /**
   * Opens the Local Tracker window
   */
  openWindow: publicProcedure
    .query(async () => {
      return LocalTrackerService.openLocalTracker()
    }),
  /**
   * Resets the Local Tracker window to its default dimensions.
   * The window does not need to be open.
   */
  resetWindowRect: publicProcedure
    .query(async () => {
      const rect = LocalTrackerService.getInitialWindowRect()
      await SettingsService.instance.setSetting('LocalTrackerWindowPositionX', rect.x)
      await SettingsService.instance.setSetting('LocalTrackerWindowPositionY', rect.y)
      await SettingsService.instance.setSetting('LocalTrackerWindowPositionWidth', rect.width)
      await SettingsService.instance.setSetting('LocalTrackerWindowPositionHeight', rect.height)

      LocalTrackerService.resetWindowRect()
    }),
})
