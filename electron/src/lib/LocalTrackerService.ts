import { BrowserWindow } from 'electron'
import path from 'path'
import { getElectronUrl } from '@/api'
import { LocalTrackerWebSocketService } from '@/lib/LocalTrackerWebSocketService'
import debounce from 'lodash.debounce'
import { SettingsService } from '@/lib/SettingsService'

export class LocalTrackerService {
  private static window: BrowserWindow | null = null

  private static onSettingsChanged(settings: any, oldSettings: any) {
    if (LocalTrackerService.window && !LocalTrackerService.window.isDestroyed()) {
      if (settings.LocalTracker.Transparent !== oldSettings.LocalTracker.Transparent) {
        LocalTrackerService.openLocalTracker(true)
        return
      }

      if (settings.LocalTracker.AlwaysOnTop !== oldSettings.LocalTracker.AlwaysOnTop) {
        LocalTrackerService.window.setAlwaysOnTop(settings.LocalTracker.AlwaysOnTop, 'normal')
      }

      if (settings.LocalTracker.IgnoreMouse !== oldSettings.LocalTracker.IgnoreMouse) {
        LocalTrackerService.window.setIgnoreMouseEvents(settings.LocalTracker.IgnoreMouse, {
          forward: true,
        })
      }
    }
  }

  private static async saveWindowRect() {
    await SettingsService.transaction((settings: any) => {
      if (this.window) {
        const position = this.window.getPosition()
        const size = this.window.getSize()
        settings.LocalTracker.X = position[0]
        settings.LocalTracker.Y = position[1]
        settings.LocalTracker.Width = size[0]
        settings.LocalTracker.Height = size[1]
        return settings
      }
    })
  }

  static async openLocalTracker(forceReopenWindow = false, ) {
    SettingsService.listen(this.onSettingsChanged)

    if (!this.window || this.window.isDestroyed() || forceReopenWindow) {
      if (this.window?.isDestroyed() === false) {
        await this.saveWindowRect()
        this.window?.destroy()
      }

      const settings = await SettingsService.getCurrentSettings()

      this.window = new BrowserWindow({
        autoHideMenuBar: true,
        webPreferences: {
          nodeIntegration: Boolean(process.env.ELECTRON_NODE_INTEGRATION),
          contextIsolation: true,
          preload: path.join(__dirname, 'preload.js'),
        },
        backgroundColor: settings.LocalTracker.Transparent ? undefined : '#050e17',
        transparent: settings.LocalTracker.Transparent,
        frame: false,
        show: false,
        paintWhenInitiallyHidden: true,
      })

      if (process.env.WEBPACK_DEV_SERVER_URL) {
        this.window.webContents.openDevTools()
      }

      this.window.once('ready-to-show', () => {
        this.window?.setPosition(
          Number(settings.LocalTracker.X),
          Number(settings.LocalTracker.Y),
        )
        this.window?.setSize(
          Number(settings.LocalTracker.Width),
          Number(settings.LocalTracker.Height),
        )
        this.window?.show()
      })

      this.window.setAspectRatio(700 / 405)

      if (settings.LocalTracker.AlwaysOnTop) {
        this.window.setAlwaysOnTop(true, 'normal')
      }

      if (settings.LocalTracker.IgnoreMouse) {
        this.window.setIgnoreMouseEvents(true, {
          forward: true,
        })
      }

      this.window.on('moved', debounce(() => this.saveWindowRect(), 500))
      this.window.on('resized', debounce(() => this.saveWindowRect(), 500))

      await this.window.loadURL(getElectronUrl(`/tracker?source=ws://127.0.0.1:${LocalTrackerWebSocketService.port}`))
    } else {
      this.window.focus()
    }
  }
}
