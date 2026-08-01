import {router} from "@launcher/api/trpc"
import {auth} from "@launcher/api/routers/auth"
import {fs} from "@launcher/api/routers/fs"
import {inputBindings} from "@launcher/api/routers/inputBindings"
import {launcher} from "@launcher/api/routers/launcher"
import {localTracker} from "@launcher/api/routers/localTracker"
import {localTrackerWebSocket} from "@launcher/api/routers/localTrackerWebSocket"
import {randoIpc} from "@launcher/api/routers/randoIpc"
import {seedgenServer} from "@launcher/api/routers/seedgenServer"
import {settings} from "@launcher/api/routers/settings"
import {shell} from "@launcher/api/routers/shell"
import {supportBundle} from "@launcher/api/routers/supportBundle"
import {toolsWindow} from "@launcher/api/routers/toolsWindow"
import {updater} from "@launcher/api/routers/updater"
import type {Unsubscribable as TrpcUnsubscribable} from "@trpc/server/observable"

export const appRouter = router({
  auth,
  fs,
  inputBindings,
  launcher,
  localTracker,
  localTrackerWebSocket,
  randoIpc,
  seedgenServer,
  settings,
  shell,
  supportBundle,
  toolsWindow,
  updater,
})

// Export type router type signature,
// NOT the router itself.
export type LauncherApiRouter = typeof appRouter;
export type Unsubscribable = TrpcUnsubscribable
