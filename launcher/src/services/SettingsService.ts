import {EventEmitter} from "events"
import {getUserDataPath} from "../paths"
import fs from "fs"
import {merge} from "lodash"

export type Settings = ReturnType<typeof SettingsService.getDefaultSettings>
export type SettingKey = keyof Settings
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

  /**
   * Returns the default settings values.
   */
  public static getDefaultSettings() {
    // TODO
    // const localTrackerInitialWindowRect = LocalTrackerService.getInitialWindowRect()

    return {
      ServerHost: "wotw.orirando.com",  // TODO: Client
      ServerTLS: true,  // TODO: Client
      // TODO: Infer UDP Port from WS connection
      UseMicrosoftStore: false,  // TODO: Client
      DeveloperMode: false,  // TODO: Client
      DebugControls: false,  // TODO: Client
      HideQuestFilter: true,
      HideWarpFilter: true,
      HideCollectableFilter: true,
      AlwaysShowWarps: true,
      AlwaysShowKeystones: true,
      EnableWorldMap: false,  // TODO: Client
      GrappleMouseControl: false,
      BurrowMouseControl: false,
      WaterDashMouseControl: false,
      HybridMouseControl: false,
      LaunchWithTracker: true,
      FunnyMoney: false,
      InvertFastSwim: false,
      LockCursor: false,  // TODO: Client
      UpdateToPrereleaseVersions: false,
      ShowStatsAfterFinish: true,
      ShowAllSecrets: true,  // TODO: Client
      DisableAutoAim: false,  // TODO: Client
      AlwaysShowKeystoneDoors: true,
      SelectInLogicFilterByDefault: true,
      EnableMinimap: false,
      EnableNativeControllerSupport: true,  // TODO: Client
      MapIconTransparency: 0.25,
      MapPanSpeed: 1.0,
      CameraShakeIntensity: 1.0,
      LocalTrackerWindowPositionX: 0.0,  // localTrackerInitialWindowRect.x TODO: Initialize
      LocalTrackerWindowPositionY: 0.0,  // localTrackerInitialWindowRect.y TODO: Initialize
      LocalTrackerWindowPositionWidth: 0.0,  // localTrackerInitialWindowRect.width TODO: Initialize
      LocalTrackerWindowPositionHeight: 0.0,  // localTrackerInitialWindowRect.height TODO: Initialize
      LocalTrackerShowTimer: true,
      LocalTrackerTransparent: false,
      LocalTrackerAlwaysOnTop: false,
      LocalTrackerIgnoreMouse: false,
      LocalTrackerShowWillowHearts: true,
      LocalTrackerHideHeartsUntilFirstHeart: true,
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
      console.log("Settings file not found. Using default settings.")
    }

    this.settingsCache = {...settingsObject}

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
    this.events.emit("settingChanged", key, value)

    if (this.settingsFlushTimeoutId === null) {
      this.settingsFlushTimeoutId = setTimeout(this.flushSettings, 2000)
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
  }
}
