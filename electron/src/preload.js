import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronApi', {
  ...ipcRenderer,
  on: (channel, callback) => ipcRenderer.on(channel, callback),
})
contextBridge.exposeInMainWorld('__oriRandoUiElectron', true)
