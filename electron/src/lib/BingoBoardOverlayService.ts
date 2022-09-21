import { BrowserWindow } from 'electron'
import { getElectronUrl } from '@/api'
import { WindowService } from '@/lib/WindowService'

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

      this.window = WindowService.createWindow({
        transparent: true,
        frame: false,
        show: false,
        focusable: false,
        skipTaskbar: false,
        fullscreen: true,
        paintWhenInitiallyHidden: true,
        opacity: 0.9,
      })

      if (process.env.WEBPACK_DEV_SERVER_URL) {
        this.window.webContents.openDevTools()
      }

      this.window.once('ready-to-show', () => {
        this.window?.maximize()
        this.window?.hide()
      })

      this.window.setAlwaysOnTop(true, 'normal')
      this.window.setIgnoreMouseEvents(true, {
        forward: true,
      })
    }

    await this.window.loadURL(getElectronUrl(`/game/${multiverseId}?isBingoBoardOverlay=true&registerInteractiveHandlers=false`))
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
