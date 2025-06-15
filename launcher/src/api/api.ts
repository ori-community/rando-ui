import {auth} from "./routers/auth"
import {router} from "./trpc"
import {timer} from "./routers/timer"
import {updater} from "./routers/updater"

export const appRouter = router({
  auth,
  timer,
  updater,
})

// Export type router type signature,
// NOT the router itself.
export type LauncherApiRouter = typeof appRouter;
