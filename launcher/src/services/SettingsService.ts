import {EventEmitter} from "events"
import {getUserDataPath} from "@launcher/paths"
import fs from "fs"
import {merge} from "lodash"
import log from "electron-log/main"
import {LocalTrackerService} from "@launcher/services/LocalTrackerService"
import {SettingKey, Settings} from "@shared/types/settings"
import {LauncherService} from "@launcher/services/LauncherService"

type SettingsEvent = {
  /** Emitted when a single setting changed */
  settingChanged: [SettingKey, Settings[SettingKey]],

  /** Emitted when all settings were (re-)loaded */
  settingsLoaded: [Settings],
}

export class SettingsService {
  public static readonly instance = new SettingsService()

  /** The currently loaded settings */
  private settingsCache: Settings | null = null

  /** True if settingsCache needs to be flushed */
  private settingsCacheDirty = false

  /** Timeout ID (from setTimeout) when a settings flush is queued, or null when nothing is queued */
  private settingsFlushTimeoutId: NodeJS.Timeout | null = null

  public readonly events: EventEmitter<SettingsEvent> = new EventEmitter()

  public static getDefaultGameBinaryPath() {
    switch (LauncherService.getPlatform()) {
      case "windows":
        return "C:\\Program Files (x86)\\Steam\\common\\Ori and the Will of the Wisps\\oriwotw.exe"
      case "linux":
        return `/home/${process.env.USER ?? "user"}/.steam/steam/steamapps/common/Ori and the Will of the Wisps/oriwotw.exe`
    }
  }

  public static getDefaultSteamBinaryPath() {
    switch (LauncherService.getPlatform()) {
      case "windows":
        return "C:\\Program Files (x86)\\Steam\\steam.exe"
      case "linux":
        return "steam"
    }
  }

  /**
   * Returns the default settings values.
   */
  public static getDefaultSettings(): Settings {
    const localTrackerInitialWindowRect = LocalTrackerService.getInitialWindowRect()

    return {
      ServerHost: "wotw.orirando.com",
      ServerTLS: true,
      DeveloperMode: false,
      DebugControls: false,
      HideQuestFilter: true,
      HideWarpFilter: true,
      HideCollectableFilter: true,
      AlwaysShowWarps: true,
      AlwaysShowKeystones: true,
      AlwaysShowKeystoneDoors: true,
      EnableWorldMap: false,
      GrappleMouseControl: false,
      BurrowMouseControl: false,
      WaterDashMouseControl: false,
      HybridMouseControl: false,
      LaunchWithTracker: true,
      FunnyMoney: false,
      InvertFastSwim: false,
      LockCursor: false,
      UpdateToPrereleaseVersions: false,
      ShowStatsAfterFinish: true,
      ShowAllSecrets: true,
      DisableAutoAim: false,
      SelectInLogicFilterByDefault: true,
      EnableMinimap: false,
      EnableNativeControllerSupport: true,
      MapIconTransparency: 0.25,
      MapPanSpeed: 1.0,
      CameraShakeIntensity: 1.0,
      LocalTrackerWindowPositionX: localTrackerInitialWindowRect.x,
      LocalTrackerWindowPositionY: localTrackerInitialWindowRect.y,
      LocalTrackerWindowPositionWidth: localTrackerInitialWindowRect.width,
      LocalTrackerWindowPositionHeight: localTrackerInitialWindowRect.height,
      LocalTrackerShowTimer: true,
      LocalTrackerTransparent: false,
      LocalTrackerAlwaysOnTop: false,
      LocalTrackerIgnoreMouse: false,
      LocalTrackerShowWillowHearts: true,
      LocalTrackerHideHeartsUntilFirstHeart: true,
      GameLaunchMethod: "steam",
      ModloaderMethod: "proxy",
      ValidateProxyModloader: true,
      GameBinaryPath: SettingsService.getDefaultGameBinaryPath(),
      SteamBinaryPath: SettingsService.getDefaultSteamBinaryPath(),
    }
  }

  /**
   * Loads stored settings from settings.json into cache.
   * The values from the stored settings are merged on top of
   * the default settings values. If settings.json does not exist,
   * the default settings are loaded.
   */
  private async loadSettingsToCache() {
    const settingsFilePath = getUserDataPath("settings.json")
    let settingsObject: Settings = SettingsService.getDefaultSettings()

    if (fs.existsSync(settingsFilePath)) {
      const settingsContent = await fs.promises.readFile(settingsFilePath, {encoding: "utf-8"})
      settingsObject = merge(settingsObject, JSON.parse(settingsContent))
    } else {
      log.info("Settings file not found. Using default settings.")
    }

    this.settingsCache = {...settingsObject}
    log.info("Settings loaded")

    this.events.emit("settingsLoaded", await this.getSettings())
  }

  /**
   * Returns the current settings.
   * The returned object is a copy of the loaded settings.
   * Modifying the returned object does not modify settings.
   * To modify settings, use `setSetting`.
   */
  public async getSettings(): Promise<Settings> {
    if (this.settingsCache === null) {
      await this.loadSettingsToCache()
    }

    return {...this.settingsCache}
  }

  /**
   * Sets the value of a setting.
   * Settings are not flushed immediately, but a flush
   * is queued for in at most 2 seconds.
   * Use `flushSettings` to flush settings immediately.
   */
  public async setSetting<K extends SettingKey>(key: K, value: Settings[K]) {
    if (this.settingsCache === null) {
      await this.loadSettingsToCache()
    }

    if (this.settingsCache[key] === value) {
      return
    }

    this.settingsCache[key] = value
    this.settingsCacheDirty = true
    log.info("Setting changed:", key, value)
    this.events.emit("settingChanged", key, value)

    if (this.settingsFlushTimeoutId === null) {
      this.settingsFlushTimeoutId = setTimeout(() => this.flushSettings(), 2000)
    }
  }

  /**
   * Flush settings to disk immediately.
   */
  public async flushSettings() {
    const settingsFilePath = getUserDataPath("settings.json")

    if (this.settingsFlushTimeoutId !== null) {
      clearTimeout(this.settingsFlushTimeoutId)
      this.settingsFlushTimeoutId = null
    }

    const json = JSON.stringify(this.settingsCache, null, 2)
    this.settingsCacheDirty = false

    await fs.promises.writeFile(settingsFilePath, json, {encoding: "utf-8"})
    log.info("Settings saved")
  }
}
