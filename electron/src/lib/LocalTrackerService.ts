import { BrowserWindow } from 'electron'
import path from 'path'
import { getElectronUrl } from '@/api'
import { LocalTrackerWebSocketService } from '@/lib/LocalTrackerWebSocketService'

export class LocalTrackerService {
  private static window: BrowserWindow | null = null

  static async openLocalTracker(forceNewInstance = false) {
    if (!this.window || this.window.isDestroyed() || forceNewInstance) {
      this.window = new BrowserWindow({
        width: 700,
        height: 440,
        autoHideMenuBar: true,
        webPreferences: {
          nodeIntegration: Boolean(process.env.ELECTRON_NODE_INTEGRATION),
          contextIsolation: true,
          preload: path.join(__dirname, 'preload.js'),
        },
      })

      this.window.setAlwaysOnTop(true, 'normal')

      await this.window.loadURL(getElectronUrl(`/tracker?source=ws://127.0.0.1:${LocalTrackerWebSocketService.port}`))
    } else {
      this.window.focus()
    }
  }
}
