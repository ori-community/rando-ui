import {auth} from "@/api/routers/auth"
import {router} from "@/api/trpc"
import {settings} from "@/api/routers/settings"
import {randoIpc} from "@/api/routers/randoIpc"
import {updater} from "@/api/routers/updater"
import {localTrackerWebSocket} from "@/api/routers/localTrackerWebSocket"

export const appRouter = router({
  auth,
  localTrackerWebSocket,
  randoIpc,
  settings,
  updater,
})

// Export type router type signature,
// NOT the router itself.
export type LauncherApiRouter = typeof appRouter;
