import {getElectronUrl} from "@launcher/helpers"
import {LocalTrackerWebSocketService} from "@launcher/services/LocalTrackerWebSocketService"
import {PopupWindow} from "@launcher/services/PopupWindow"
import {SettingsService} from "@launcher/services/SettingsService"
import type {SettingKey} from "@shared/types/settings"
import {BrowserWindow, Rectangle, screen} from "electron"
import {debounce} from "lodash"

export class LocalTrackerService {
  private static window: BrowserWindow | null = null
  private static isSubscribedToSettings: boolean = false
  private static isDemoMode: boolean = false

  private static onSettingChanged(key: SettingKey, value: any) {
    if (LocalTrackerService.window && !LocalTrackerService.window.isDestroyed()) {
      switch (key) {
        case "LocalTrackerTransparent":
          LocalTrackerService.openLocalTracker(true, LocalTrackerService.isDemoMode)
          break

        case "LocalTrackerAlwaysOnTop":
          LocalTrackerService.window.setAlwaysOnTop(value, "normal")
          break

        case "LocalTrackerIgnoreMouse":
          LocalTrackerService.window.setIgnoreMouseEvents(value, {
            forward: true,
          })
          break
      }
    }
  }

  private static async saveWindowRect() {
    if (LocalTrackerService.window) {
      const position = LocalTrackerService.window.getPosition()
      const size = LocalTrackerService.window.getSize()
      await SettingsService.instance.setSetting("LocalTrackerWindowPositionX", position[0])
      await SettingsService.instance.setSetting("LocalTrackerWindowPositionY", position[1])
      await SettingsService.instance.setSetting("LocalTrackerWindowPositionWidth", size[0])
      await SettingsService.instance.setSetting("LocalTrackerWindowPositionHeight", size[1])
    }
  }

  static isOpen(): boolean {
    return !!this.window && !this.window.isDestroyed()
  }

  static close() {
    if (this.isOpen()) {
      this.window?.close()
    }
  }

  static async openLocalTracker(forceReopenWindow = false, demoMode = false) {
    if (!this.isSubscribedToSettings) {
      SettingsService.instance.events.on("settingChanged", LocalTrackerService.onSettingChanged)
      this.isSubscribedToSettings = true
    }

    if (!this.window || this.window.isDestroyed() || forceReopenWindow) {
      if (this.window?.isDestroyed() === false) {
        await this.saveWindowRect()
        this.window?.destroy()
      }

      const settings = await SettingsService.instance.getSettings()

      this.window = PopupWindow.create({
        backgroundColor: settings["LocalTrackerTransparent"] ? undefined : "#050e17",
        backgroundMaterial: "none",
        transparent: settings["LocalTrackerTransparent"],
        frame: false,
        show: false,
        paintWhenInitiallyHidden: true,
        resizable: true,
      })

      if (import.meta.env.DEV) {
        this.window.webContents.openDevTools()
      }

      this.window.once("ready-to-show", () => {
        this.window?.setPosition(
          Number(settings["LocalTrackerWindowPositionX"]),
          Number(settings["LocalTrackerWindowPositionY"]),
        )
        this.window?.setSize(
          Number(settings["LocalTrackerWindowPositionWidth"]),
          Number(settings["LocalTrackerWindowPositionHeight"]),
        )
        this.window?.show()
      })

      this.window.setAspectRatio(700 / 405)

      if (settings["LocalTrackerAlwaysOnTop"]) {
        this.window.setAlwaysOnTop(true, "normal")
      }

      if (settings["LocalTrackerIgnoreMouse"]) {
        this.window.setIgnoreMouseEvents(true, {
          forward: true,
        })
      }

      this.window.on(
        "move",
        debounce(() => this.saveWindowRect(), 500),
      )
      this.window.on(
        "resize",
        debounce(() => this.saveWindowRect(), 500),
      )

      let url = `/tracker?source=ws://127.0.0.1:${LocalTrackerWebSocketService.port}`

      LocalTrackerService.isDemoMode = demoMode
      if (demoMode) {
        url += "&demo=true"
      }

      await this.window.loadURL(getElectronUrl(url))
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

  static focusIfOpen() {
    if (this.window && !this.window.isDestroyed()) {
      this.window.focus()
    }
  }
}
