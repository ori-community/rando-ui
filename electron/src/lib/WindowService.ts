import { BrowserWindow } from 'electron'
import path from 'path'
import BrowserWindowConstructorOptions = Electron.BrowserWindowConstructorOptions

export class WindowService {
  static createWindow(options: BrowserWindowConstructorOptions) {
    return new BrowserWindow({
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: Boolean(process.env.ELECTRON_NODE_INTEGRATION),
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
      },
      ...options,
    })
  }
}
