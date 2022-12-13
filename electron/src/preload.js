import { contextBridge, ipcRenderer } from 'electron'
import os from 'os'

contextBridge.exposeInMainWorld('electronApi', {
  ...ipcRenderer,
  on: (channel, callback) => ipcRenderer.on(channel, callback),
})
contextBridge.exposeInMainWorld('__oriRandoUiElectron', true)
contextBridge.exposeInMainWorld('electronPlatform', os.platform())
