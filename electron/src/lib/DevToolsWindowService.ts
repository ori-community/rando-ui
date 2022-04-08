import { BrowserWindow } from 'electron'
import { getElectronUrl } from '@/api'
import { WindowService } from '@/lib/WindowService'

export class DevToolsWindowService {
  private static window: BrowserWindow | null = null

  static close() {
    if (this.window && !this.window.isDestroyed()) {
      this.window.close()
    }
  }

  static async open() {
    if (!this.window || this.window.isDestroyed()) {
      if (this.window?.isDestroyed() === false) {
        this.window?.destroy()
      }

      this.window = WindowService.createWindow({
        width: 700,
        height: 700,
      })

      if (process.env.WEBPACK_DEV_SERVER_URL) {
        this.window.webContents.openDevTools()
      }

      this.window.once('ready-to-show', () => {
        this.window?.show()
      })

      await this.window.loadURL(getElectronUrl(`/electron/dev`))
    }
  }
}
