import {publicProcedure, router} from "@/api/trpc"
import {VersionService} from "@/services/VersionService"

export const updater = router({
  /**
   * Returns the version string, or "develop" if no version is specified.
   */
  getVersion: publicProcedure
    .query(async () => {
      return await VersionService.getVersion()
    })
})
