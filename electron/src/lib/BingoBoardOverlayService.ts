import { BrowserWindow } from 'electron'
import path from 'path'
import { getElectronUrl } from '@/api'
import { LocalTrackerWebSocketService } from '@/lib/LocalTrackerWebSocketService'
import debounce from 'lodash.debounce'
import { SettingsService } from '@/lib/SettingsService'

export class BingoBoardOverlayService {
  private static window: BrowserWindow | null = null

  static close() {
    if (this.window && !this.window.isDestroyed()) {
      this.window.close()
    }
  }

  static async prepareBingoBoardOverlay(multiverseId: number) {
    if (!this.window || this.window.isDestroyed()) {
      if (this.window?.isDestroyed() === false) {
        this.window?.destroy()
      }

      this.window = new BrowserWindow({
        autoHideMenuBar: true,
        webPreferences: {
          nodeIntegration: Boolean(process.env.ELECTRON_NODE_INTEGRATION),
          contextIsolation: true,
          preload: path.join(__dirname, 'preload.js'),
        },
        transparent: true,
        frame: false,
        show: false,
        focusable: false,
        paintWhenInitiallyHidden: true,
      })

      if (process.env.WEBPACK_DEV_SERVER_URL) {
        this.window.webContents.openDevTools()
      }

      this.window.once('ready-to-show', () => {
        this.window?.maximize()
        this.window?.hide()
      })

      this.window.setAspectRatio(1)
      this.window.setAlwaysOnTop(true, 'normal')
      this.window.setIgnoreMouseEvents(true, {
        forward: true,
      })

      await this.window.loadURL(getElectronUrl(`/game/${multiverseId}?isBingoBoardOverlay=true`))
    }
  }

  static async show() {
    if (this.window && !this.window.isDestroyed()) {
      this.window.show()
    }
  }

  static async hide() {
    if (this.window && !this.window.isDestroyed()) {
      this.window.hide()
    }
  }

  static async toggleVisibility() {
    if (this.window && !this.window.isDestroyed()) {
      this.window.isVisible()
        ? this.window.hide()
        : this.window.show()
    }
  }
}
