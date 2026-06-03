import {publicProcedure, router} from "@launcher/api/trpc"
import {shell as electronShell} from "electron"
import {SupportBundleService} from "@launcher/services/SupportBundleService"
import {observable} from "@trpc/server/observable"

export const supportBundle = router({
  /**
   * Create a support bundle and show the resulting ZIP file in the file manager.
   */
  createAndShowInExplorer: publicProcedure
    .query(async () => {
      const supportBundlePath = await SupportBundleService.instance.createSupportBundle()
      electronShell.showItemInFolder(supportBundlePath)
    }),
  /**
   * Subscribe to get paths of support bundles that are automatically created from
   * detected crashes
   */
  onSupportBundleCreatedFromCrash: publicProcedure
    .subscription(() => {
      return observable<string>((emit) => {
        const onSupportBundleCreatedFromCrash = (value: string) => emit.next(value)
        SupportBundleService.instance.events.on("onSupportBundleCreatedFromCrash", onSupportBundleCreatedFromCrash)

        return () => {
          SupportBundleService.instance.events.off("onSupportBundleCreatedFromCrash", onSupportBundleCreatedFromCrash)
        }
      })
    }),
})
