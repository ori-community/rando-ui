import { BrowserWindow } from 'electron'
import path from 'path'
import { getElectronUrl } from '@/api'
import { LocalTrackerWebSocketService } from '@/lib/LocalTrackerWebSocketService'

export class LocalTrackerService {
  static async openLocalTracker() {
    const loginWindow = new BrowserWindow({
      width: 700,
      height: 440,
      autoHideMenuBar: true,
      alwaysOnTop: true,
      webPreferences: {
        nodeIntegration: Boolean(process.env.ELECTRON_NODE_INTEGRATION),
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
      },
    })

    await loginWindow.loadURL(getElectronUrl(`/tracker?source=ws://127.0.0.1:${LocalTrackerWebSocketService.port}`))
  }
}
