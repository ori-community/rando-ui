import { ipcMain } from 'electron'
import apis from './api/index'
import { getWindow } from '@/background'

class UIIPC {
  queue: {event: string, payload: any}[] = []
  uiReady: boolean = false

  queueSend(event: string, payload: any = null) {
    if (!this.uiReady) {
      this.queue.push({event, payload})
    } else {
      this.forceSend(event, payload)
    }
  }

  forceSend(event: string, payload: any = null) {
    getWindow()?.webContents.send(event, payload)
  }

  handleQueuedEvents() {
    while (this.queue.length > 0) {
      const message = this.queue.shift()
      if (message) {
        this.forceSend(message.event, message.payload)
      }
    }
  }
}

export const uiIpc = new UIIPC()

export const registerUIIpcApi = () => {
  for (const apiNamespace of Object.keys(apis)) {
    // TODO: Convert everything to TS
    // @ts-ignore
    for (const method of Object.keys(apis[apiNamespace])) {
      // @ts-ignore
      ipcMain.handle(`${apiNamespace}.${method}`, apis[apiNamespace][method])
      console.log(`Registered UI-IPC handler "${apiNamespace}.${method}"`)
    }
  }

  ipcMain.handle(`ready`, () => {
    uiIpc.uiReady = true
    uiIpc.handleQueuedEvents()
  })
}
