import {publicProcedure, router} from "@launcher/api/trpc"
import {SettingsService} from "@launcher/services/SettingsService"
import {Setting, SettingKey, Settings} from "@shared/types/settings"
import {z} from "zod"
import log from "electron-log/main"
import {observable} from "@trpc/server/observable"
import {RandoIPCService} from "@launcher/services/RandoIPCService"

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
  /**
   * Subscribe to get notified on settings changes
   */
  onSettingChanged: publicProcedure
    .subscription(() => {
      return observable<Setting>((emit) => {
        const onSettingChanged = (key: SettingKey, value: Settings[SettingKey]) => emit.next({
          key, value,
        })

        SettingsService.instance.events.on("settingChanged", onSettingChanged)

        return () => {
          SettingsService.instance.events.off("settingChanged", onSettingChanged)
        }
      })
    }),
})
