import {BrowserWindow} from "electron"
import {getElectronUrl} from "@launcher/helpers"
import {PopupWindow} from "@launcher/services/PopupWindow"


export class ToolsWindowService {
  private static window: BrowserWindow | null = null

  static isOpen(): boolean {
    return this.window && !this.window.isDestroyed()
  }

  static close() {
    if (this.isOpen()) {
      this.window.close()
    }
  }

  static async open() {
    if (!this.window || this.window.isDestroyed()) {
      if (this.window?.isDestroyed() === false) {
        this.window?.destroy()
      }

      this.window = PopupWindow.create({
        width: 700,
        height: 700,
      })

      if (process.env.WEBPACK_DEV_SERVER_URL) {
        this.window.webContents.openDevTools()
      }

      this.window.once("ready-to-show", () => {
        this.window?.show()
      })

      await this.window.loadURL(getElectronUrl(`/electron/tools`))
    }
  }

}
