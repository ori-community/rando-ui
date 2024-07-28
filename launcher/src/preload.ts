import { exposeElectronTRPC } from 'electron-trpc/main'
import { contextBridge } from 'electron'

process.once('loaded', async () => {
  exposeElectronTRPC()
  console.log('Exposed tRPC API')

  contextBridge.exposeInMainWorld('__isElectron', true)
})
