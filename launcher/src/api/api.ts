import {auth} from "./routers/auth"
import {router} from "./trpc"
import {settings} from "./routers/settings"
import {randoIpc} from "./routers/randoIpc"
import {updater} from "./routers/updater"

export const appRouter = router({
  auth,
  randoIpc,
  settings,
  updater,
})

// Export type router type signature,
// NOT the router itself.
export type LauncherApiRouter = typeof appRouter;
