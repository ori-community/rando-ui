import { ipcMain } from 'electron'
import apis from './api/index'
import { getWindow } from '~/electron/src/background'

class UIIPC {
  constructor() {
    this.queue = []
    this.uiReady = false
  }

  queueSend(event, payload) {
    if (!this.uiReady) {
      this.queue.push({event, payload})
    } else {
      this.forceSend(event, payload)
    }
  }

  forceSend(event, payload) {
    getWindow().webContents.send(event, payload)
  }

  handleQueuedEvents() {
    while (this.queue.length > 0) {
      const message = this.queue.shift()
      this.forceSend(message.event, message.payload)
    }
  }
}

export const uiIpc = new UIIPC()

export const registerUIIpcApi = () => {
  for (const apiNamespace of Object.keys(apis)) {
    for (const method of Object.keys(apis[apiNamespace])) {
      ipcMain.handle(`${apiNamespace}.${method}`, apis[apiNamespace][method])
      console.log(`Registered UI-IPC handler "${apiNamespace}.${method}"`)
    }
  }

  ipcMain.handle(`ready`, () => {
    uiIpc.uiReady = true
    uiIpc.handleQueuedEvents()
  })
}
