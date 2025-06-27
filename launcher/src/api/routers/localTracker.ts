import {publicProcedure, router} from "@launcher/api/trpc"
import {observable} from "@trpc/server/observable"
import {LocalTrackerWebSocketService} from "@launcher/services/LocalTrackerWebSocketService"
import {LocalTrackerService} from "@launcher/services/LocalTrackerService"
import {SettingsService} from "@launcher/services/SettingsService"

export const localTracker = router({
  openWindow: publicProcedure
    .query(async () => {
      return LocalTrackerService.openLocalTracker()
    }),
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
