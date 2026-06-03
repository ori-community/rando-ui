import {publicProcedure, router} from "@launcher/api/trpc"
import {shell as electronShell} from "electron"
import {SupportBundleService} from "@launcher/services/SupportBundleService"

export const supportBundle = router({
  /**
   * Returns the version string, or "develop" if no version is specified.
   */
  createAndShowInExplorer: publicProcedure
    .query(async () => {
      const supportBundlePath = await SupportBundleService.instance.createSupportBundle()
      electronShell.showItemInFolder(supportBundlePath)
    })
})
