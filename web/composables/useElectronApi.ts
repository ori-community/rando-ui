import {type CreateTRPCProxyClient, createTRPCProxyClient} from "@trpc/client"
import type {LauncherApiRouter} from "@launcher/api/api"
import {ipcLink} from "electron-trpc/renderer"

let client: CreateTRPCProxyClient<LauncherApiRouter> | null = null

export const useElectronApi = () => {
  if (!client && useIsElectron()) {
    client = createTRPCProxyClient<LauncherApiRouter>({
      links: [ipcLink()],
    })
  }

  return client
}
