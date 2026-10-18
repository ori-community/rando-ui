import {publicProcedure, router} from "@launcher/api/trpc"
import {LocalTrackerService} from "@launcher/services/LocalTrackerService"
import {SettingsService} from "@launcher/services/SettingsService"
import {z} from "zod"

export const localTracker = router({
  /**
   * Opens the Local Tracker window
   */
  openWindow: publicProcedure
    .input(z.object({
      demoMode: z.boolean()
    }).optional())
    .query(async ({input}) => {
      const demoMode = input?.demoMode
      return LocalTrackerService.openLocalTracker(demoMode, demoMode)
    }),
  /**
   * Closes the Local Tracker window
   */
  closeWindow: publicProcedure
    .query(async () => {
      return LocalTrackerService.close()
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
      LocalTrackerService.focusIfOpen()
    }),
})
