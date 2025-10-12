import {publicProcedure, router} from "@launcher/api/trpc"
import {SettingsService} from "@launcher/services/SettingsService"
import {Setting, SettingKey, Settings} from "@shared/types/settings"
import {z} from "zod"
import {observable} from "@trpc/server/observable"
import {LauncherService} from "@launcher/services/LauncherService"

export const launcher = router({
  /**
   * @see LauncherService.getPlatform
   */
  getPlatform: publicProcedure
    .query(() => {
      return LauncherService.getPlatform()
    }),
  /**
   * @see LauncherService.validateSetup
   */
  validateSetup: publicProcedure
    .query(async () => {
      return await LauncherService.validateSetup()
    }),
  /**
   * @see LauncherService.installOrUpdateProxyModloader
   */
  installOrUpdateProxyModloader: publicProcedure
    .query(async () => {
      await LauncherService.installOrUpdateProxyModloader()
    }),
  /**
   * @see LauncherService.launchOrFocusRandomizer
   */
  launchOrFocusRandomizer: publicProcedure
    .query(async () => {
      await LauncherService.launchOrFocusRandomizer()
    }),
})
