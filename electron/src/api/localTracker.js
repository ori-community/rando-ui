import { LocalTrackerWebSocketService } from '~/electron/src/lib/LocalTrackerWebSocketService'
import { BrowserWindow } from 'electron'
import { getElectronUrl } from '@/api'

export default {
  isTrackerRunning() {
    return LocalTrackerWebSocketService.isRunning
  },
  getPort() {
    return LocalTrackerWebSocketService.port
  },
  async openWindow() {
    const loginWindow = new BrowserWindow({
      width: 600,
      height: 380,
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
        contextIsolation: true,
      },
    })

    await loginWindow.loadURL(getElectronUrl(`/electron/windows/tracker?source=ws://127.0.0.1:${LocalTrackerWebSocketService.port}`))
  }
}
