import fs from 'fs'
import ini from 'ini'
import { RANDOMIZER_BASE_PATH } from './Constants'

const SETTINGS_PATH = `${RANDOMIZER_BASE_PATH}/settings.ini`
const getDefaultSettings = () => ({
  Paths: {
    Steam: 'C:\\Program Files (x86)\\Steam\\steam.exe',
  },
  Flags: {
    UseWinStore: false,
    Dev: false,
    MuteInjectLogs: false,
    ShowShortCutscenes: false,
    ShowLongCutscenes: false,
    HideQuestFilter: false,
    HideWarpFilter: false,
    HideCollectableFilter: false,
    AlwaysShowWarps: false,
    GrappleMouseControl: false,
    BurrowMouseControl: false,
    WaterDashMouseControl: false,
    DisableNetcode: false,
    LaunchWithTracker: false,
  },
})

let settingsCache = null

export class SettingsService {
  static async makeSureSettingsFileExists() {
    await this.readSettings()
    await this.writeSettings()
  }

  static async readSettings() {
    if (!fs.existsSync(SETTINGS_PATH)) {
      console.log('Settings file not found, using default settings...')
      settingsCache = getDefaultSettings()
    } else {
      const settings = await fs.promises.readFile(SETTINGS_PATH, { encoding: 'utf16le' })

      settingsCache = {
        ...getDefaultSettings(),
        ...ini.parse(settings.trimLeft()),
      }
    }

    console.log('Settings loaded', settingsCache)

    return settingsCache
  }

  static setSettings(settings) {
    settingsCache = settings
  }

  static async writeSettings() {
    await fs.promises.writeFile(SETTINGS_PATH, ini.encode(settingsCache), { encoding: 'utf16le' })
  }
}
