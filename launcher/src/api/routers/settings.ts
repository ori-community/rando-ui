import {publicProcedure, router} from "@/api/trpc"
import {SettingKey, SettingsService} from "@/services/SettingsService"
import {z} from "zod"

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
      value: z.string().or(z.number()).or(z.boolean())
    }))
    .query(async ({input}) => {
      await SettingsService.instance.setSetting(input.key as SettingKey, input.value)
    })
})
