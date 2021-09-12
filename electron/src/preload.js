import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronApi', ipcRenderer)
contextBridge.exposeInMainWorld('__oriRandoUiElectron', true)
