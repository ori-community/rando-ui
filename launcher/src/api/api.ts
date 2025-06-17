import {auth} from "./routers/auth"
import {router} from "./trpc"
import {settings} from "./routers/settings"
import {timer} from "./routers/timer"
import {updater} from "./routers/updater"

export const appRouter = router({
  auth,
  settings,
  timer,
  updater,
})

// Export type router type signature,
// NOT the router itself.
export type LauncherApiRouter = typeof appRouter;
