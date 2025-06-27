import {publicProcedure, router} from "@launcher/api/trpc"
import {VersionService} from "@launcher/services/VersionService"

export const updater = router({
  /**
   * Returns the version string, or "develop" if no version is specified.
   */
  getVersion: publicProcedure
    .query(async () => {
      return await VersionService.getVersion()
    })
})
