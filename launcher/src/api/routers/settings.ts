import {publicProcedure, router} from "@launcher/api/trpc"
import {SettingsService} from "@launcher/services/SettingsService"
import {SettingKey} from "@shared/types/settings"
import {z} from "zod"
import log from "electron-log/main"

export const settings = router({
  /**
   * Returns all settings
   */
  getSettings: publicProcedure
    .query(async () => {
      return await SettingsService.instance.getSettings()
    }),
  /**
   * Set setting with key `key` to value `value`
   */
  setSetting: publicProcedure
    .input(z.object({
      key: z.string(),
      value: z.string().or(z.number()).or(z.boolean()),
    }))
    .query(async ({input}) => {
      await SettingsService.instance.setSetting(input.key as SettingKey, input.value)
    }),
})
