import {publicProcedure, router} from "@launcher/api/trpc"
import {SeedgenServerService} from "@launcher/services/SeedgenServerService"

export const seedgenServer = router({
  /**
   * Makes sure the seedgen HTTP server is started. Resolves when
   * seedgen opened its listener.
   */
  ensureRunning: publicProcedure
    .query(async () => {
      await SeedgenServerService.ensureRunning()
    }),
})
