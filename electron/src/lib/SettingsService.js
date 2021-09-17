import fs from 'fs'
import ini from 'ini'
import { RANDOMIZER_BASE_PATH } from './Constants'

const SETTINGS_PATH = `${RANDOMIZER_BASE_PATH}/settings.ini`
const getDefaultSettings = () => ({
  Paths: {
    Steam: null,
  },
  Flags: {
    UseWinStore: false,
    SkipUpdate: false,
    Dev: false,
    MuteInjectLogs: false,
    ShowShortCutscenes: false,
    ShowLongCutscenes: false,
  },
})

let settingsCache = null

export class SettingsService {
  static async readSettings() {
    if (!fs.existsSync(SETTINGS_PATH)) {
      console.log('Settings file not found, using default settings...')
      settingsCache = getDefaultSettings()
    } else {
      settingsCache = {
        ...getDefaultSettings(),
        ...ini.parse(await fs.promises.readFile(SETTINGS_PATH, { encoding: 'utf16le' })),
      }
    }

    console.log('Settings loaded', settingsCache)

    return settingsCache
  }

  static async setSettings(event, settings) {
    settingsCache = settings
  }

  static async writeSettings() {
    await fs.promises.writeFile(SETTINGS_PATH, ini.encode(settingsCache), { encoding: 'utf16le' })
  }
}
