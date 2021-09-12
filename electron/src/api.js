import { ipcMain } from 'electron'
import apis from './api/index'

export const registerIpcApi = () => {
  for (const apiNamespace of Object.keys(apis)) {
    for (const method of Object.keys(apis[apiNamespace])) {
      ipcMain.handle(`${apiNamespace}.${method}`, apis[apiNamespace][method])
      console.log(`Registered IPC handler "${apiNamespace}.${method}"`)
    }
  }
}
