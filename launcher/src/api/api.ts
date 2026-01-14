import {router} from "@launcher/api/trpc"
import {auth} from "@launcher/api/routers/auth"
import {launcher} from "@launcher/api/routers/launcher"
import {localTracker} from "@launcher/api/routers/localTracker"
import {localTrackerWebSocket} from "@launcher/api/routers/localTrackerWebSocket"
import {randoIpc} from "@launcher/api/routers/randoIpc"
import {seedgenServer} from "@launcher/api/routers/seedgenServer"
import {settings} from "@launcher/api/routers/settings"
import {systemDialogs} from "@launcher/api/routers/systemDialogs"
import {toolsWindow} from "@launcher/api/routers/toolsWindow"
import {updater} from "@launcher/api/routers/updater"

export const appRouter = router({
  auth,
  launcher,
  localTracker,
  localTrackerWebSocket,
  randoIpc,
  seedgenServer,
  settings,
  systemDialogs,
  toolsWindow,
  updater,
})

// Export type router type signature,
// NOT the router itself.
export type LauncherApiRouter = typeof appRouter;
