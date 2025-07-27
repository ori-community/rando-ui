// DO NOT use the @launcher import alias in this file because its type
// is imported from the front end too!
import {router} from "./trpc"
import {auth} from "./routers/auth"
import {localTracker} from "./routers/localTracker"
import {localTrackerWebSocket} from "./routers/localTrackerWebSocket"
import {randoIpc} from "./routers/randoIpc"
import {settings} from "./routers/settings"
import {systemDialogs} from "./routers/systemDialogs"
import {updater} from "./routers/updater"

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
