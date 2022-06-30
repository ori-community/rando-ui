import { BrowserWindow, Rectangle, screen } from 'electron'
import path from 'path'
import { getElectronUrl } from '@/api'
import { LocalTrackerWebSocketService } from '@/lib/LocalTrackerWebSocketService'
import debounce from 'lodash.debounce'
import { SettingsService } from '@/lib/SettingsService'
import { WindowService } from '@/lib/WindowService'

export class LocalTrackerService {
  private static window: BrowserWindow | null = null

  private static onSettingChanged(key: any, value: any, oldValue: any) {
    if (
      LocalTrackerService.window &&
      !LocalTrackerService.window.isDestroyed()
    ) {
      switch (key) {

        case 'LocalTracker.Transparent':
          LocalTrackerService.openLocalTracker(true)
          break

        case 'LocalTracker.AlwaysOnTop':
          LocalTrackerService.window.setAlwaysOnTop(
            value,
            'normal',
          )
          break

        case 'LocalTracker.IgnoreMouse':
          LocalTrackerService.window.setIgnoreMouseEvents(
            value,
            {
              forward: true,
            },
          )
          break
      }
    }
  }

  private static async saveWindowRect() {
    if (LocalTrackerService.window) {
      const position = LocalTrackerService.window.getPosition()
      const size = LocalTrackerService.window.getSize()
      await SettingsService.setSetting('LocalTracker.X', position[0])
      await SettingsService.setSetting('LocalTracker.Y', position[1])
      await SettingsService.setSetting('LocalTracker.Width', size[0])
      await SettingsService.setSetting('LocalTracker.Height', size[1])
    }
  }

  static close() {
    if (this.window && !this.window.isDestroyed()) {
      this.window.close()
    }
  }

  static async openLocalTracker(forceReopenWindow = false) {
    SettingsService.events.on('setting-changed', LocalTrackerService.onSettingChanged)

    if (!this.window || this.window.isDestroyed() || forceReopenWindow) {
      if (this.window?.isDestroyed() === false) {
        await this.saveWindowRect()
        this.window?.destroy()
      }

      const settings = await SettingsService.getCurrentSettings()

      this.window = WindowService.createWindow({
        backgroundColor: settings['LocalTracker.Transparent']
          ? undefined
          : '#050e17',
        transparent: settings['LocalTracker.Transparent'],
        frame: false,
        show: false,
        paintWhenInitiallyHidden: true,
      })

      if (process.env.WEBPACK_DEV_SERVER_URL) {
        this.window.webContents.openDevTools()
      }

      this.window.once('ready-to-show', () => {
        this.window?.setPosition(
          Number(settings['LocalTracker.X']),
          Number(settings['LocalTracker.Y']),
        )
        this.window?.setSize(
          Number(settings['LocalTracker.Width']),
          Number(settings['LocalTracker.Height']),
        )
        this.window?.show()
      })

      this.window.setAspectRatio(700 / 405)

      if (settings['LocalTracker.AlwaysOnTop']) {
        this.window.setAlwaysOnTop(true, 'normal')
      }

      if (settings['LocalTracker.IgnoreMouse']) {
        this.window.setIgnoreMouseEvents(true, {
          forward: true,
        })
      }

      this.window.on(
        'moved',
        debounce(() => this.saveWindowRect(), 500),
      )
      this.window.on(
        'resized',
        debounce(() => this.saveWindowRect(), 500),
      )

      await this.window.loadURL(
        getElectronUrl(
          `/tracker?source=ws://127.0.0.1:${LocalTrackerWebSocketService.port}`,
        ),
      )
    } else {
      this.window.focus()
    }
  }

  static getInitialWindowRect(): Rectangle {
    const primaryScreenRect = screen.getPrimaryDisplay().bounds
    return {
      width: 700,
      height: 405,
      x: primaryScreenRect.x + primaryScreenRect.width - 700,
      y: primaryScreenRect.y + primaryScreenRect.height - 405,
    }
  }

  static resetWindowRect() {
    if (this.window && !this.window.isDestroyed()) {
      const rect = this.getInitialWindowRect()
      this.window.setPosition(rect.x, rect.y)
      this.window.setSize(rect.width, rect.height)
    }
  }
}
