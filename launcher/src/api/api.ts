import {auth} from "@launcher/api/routers/auth"
import {router} from "@launcher/api/trpc"
import {settings} from "@launcher/api/routers/settings"
import {randoIpc} from "@launcher/api/routers/randoIpc"
import {updater} from "@launcher/api/routers/updater"
import {localTrackerWebSocket} from "@launcher/api/routers/localTrackerWebSocket"
import {localTracker} from "@launcher/api/routers/localTracker"

export const appRouter = router({
  auth,
  localTracker,
  localTrackerWebSocket,
  randoIpc,
  settings,
  updater,
})

// Export type router type signature,
// NOT the router itself.
export type LauncherApiRouter = typeof appRouter;
