import path from "path"

import {BrowserWindow} from "electron"
import BrowserWindowConstructorOptions = Electron.BrowserWindowConstructorOptions

export class PopupWindow {
  static create(options: BrowserWindowConstructorOptions) {
    const window = new BrowserWindow({
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: Boolean(process.env.ELECTRON_NODE_INTEGRATION),
        contextIsolation: true,
        preload: path.join(import.meta.dirname, "preload.cjs"),
      },
      paintWhenInitiallyHidden: true,
      show: false,
      backgroundColor: options.transparent ? undefined : "#050e17",
      darkTheme: true,
      ...options,
    })

    window.on("ready-to-show", () => {
      window.show()
    })

    return window
  }
}
