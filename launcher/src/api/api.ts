import {router} from "@launcher/api/trpc"
import {auth} from "@launcher/api/routers/auth"
import {localTracker} from "@launcher/api/routers/localTracker"
import {localTrackerWebSocket} from "@launcher/api/routers/localTrackerWebSocket"
import {randoIpc} from "@launcher/api/routers/randoIpc"
import {settings} from "@launcher/api/routers/settings"
import {systemDialogs} from "@launcher/api/routers/systemDialogs"
import {updater} from "@launcher/api/routers/updater"

export const appRouter = router({
  auth,
  localTracker,
  localTrackerWebSocket,
  randoIpc,
  settings,
  systemDialogs,
  updater,
})

// Export type router type signature,
// NOT the router itself.
export type LauncherApiRouter = typeof appRouter;
