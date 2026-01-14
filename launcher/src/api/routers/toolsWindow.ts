import {publicProcedure, router} from "@launcher/api/trpc"
import {ToolsWindowService} from "@launcher/services/ToolsWindowService"

export const toolsWindow = router({
  /**
   * Opens the tools window
   */
  openWindow: publicProcedure
    .query(async () => {
      return ToolsWindowService.open()
    }),
})
