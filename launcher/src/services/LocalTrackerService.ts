import {BrowserWindow, Rectangle, screen} from "electron"
import {getElectronUrl} from "@/helpers"
import {LocalTrackerWebSocketService} from "@/services/LocalTrackerWebSocketService"
import {debounce} from "lodash"
import {SettingsService} from "@/services/SettingsService"
import type {SettingKey} from "@/services/SettingsService"
import {PopupWindow} from "@/services/PopupWindow"

export class LocalTrackerService {
  private static window: BrowserWindow | null = null
  private static isSubscribedToSettings: boolean = false

  private static onSettingChanged(key: SettingKey, value: any) {
    if (
      LocalTrackerService.window &&
      !LocalTrackerService.window.isDestroyed()
    ) {
      switch (key) {
        case "LocalTrackerTransparent":
          LocalTrackerService.openLocalTracker(true)
          break

        case "LocalTrackerAlwaysOnTop":
          LocalTrackerService.window.setAlwaysOnTop(
            value,
            "normal",
          )
          break

        case "LocalTrackerIgnoreMouse":
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
      await SettingsService.instance.setSetting("LocalTrackerWindowPositionX", position[0])
      await SettingsService.instance.setSetting("LocalTrackerWindowPositionY", position[1])
      await SettingsService.instance.setSetting("LocalTrackerWindowPositionWidth", size[0])
      await SettingsService.instance.setSetting("LocalTrackerWindowPositionHeight", size[1])
    }
  }

  static close() {
    if (this.window && !this.window.isDestroyed()) {
      this.window.close()
    }
  }

  static async openLocalTracker(forceReopenWindow = false) {
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
        backgroundColor: settings["LocalTrackerTransparent"]
          ? undefined
          : "#050e17",
        transparent: settings["LocalTrackerTransparent"],
        frame: false,
        show: false,
        paintWhenInitiallyHidden: true,
      })

      if (process.env.WEBPACK_DEV_SERVER_URL) {
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
        "moved",
        debounce(() => this.saveWindowRect(), 500),
      )
      this.window.on(
        "resized",
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
