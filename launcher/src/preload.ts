import {exposeElectronTRPC} from "electron-trpc/main"
import {contextBridge} from "electron"

process.once("loaded", async () => {
  exposeElectronTRPC()

  contextBridge.exposeInMainWorld("__isElectron", true)
})
