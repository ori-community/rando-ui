import auth from './routers/auth'
import { router } from './trpc'
import timer from './routers/timer'

export const appRouter = router({
  auth,
  timer,
})

// Export type router type signature,
// NOT the router itself.
export type LauncherApiRouter = typeof appRouter;
