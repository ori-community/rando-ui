import fs from 'fs'
import ini from 'ini'
import { RANDOMIZER_BASE_PATH } from './Constants'
import path from 'path'

const SETTINGS_PATH = `${RANDOMIZER_BASE_PATH}/settings.ini`
const CURRENT_SEED_PATH_FILE = `${RANDOMIZER_BASE_PATH}/.currentseedpath`
const OLD_RANDO_PATH_FILE = path.join(process.env.LOCALAPPDATA, 'wotwrpath.tmp')

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
    DisableQuestFocus: false,
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

  static async getOldInstallationPath() {
    const oldPathFile = OLD_RANDO_PATH_FILE
    if (!fs.existsSync(oldPathFile)) {
      console.log('SettingsService: Did not find old Rando installation')
      return null
    }

    const oldPath = await fs.promises.readFile(oldPathFile, { encoding: 'utf-8' })
    if (!fs.existsSync(oldPath)) {
      console.log(`SettingsService: Found old Rando path file, but the target path (${oldPath}) does not exist`)
      return null
    }

    return oldPath
  }

  static async importSettingsFromOldInstallation() {
    const oldPath = this.getOldInstallationPath()
    if (oldPath) {
      console.log('Importing settings.ini...')
      await fs.promises.copyFile(path.join(oldPath, 'settings.ini'), SETTINGS_PATH)

      if (fs.existsSync(path.join(oldPath, '.currentseedpath'))) {
        console.log('Importing .currentseedpath...')
        await fs.promises.copyFile(path.join(oldPath, '.currentseedpath'), CURRENT_SEED_PATH_FILE)
      }

      console.log('Renaming old rando directory...')
      await fs.promises.rename(oldPath, oldPath + '.old')

      console.log('Deleting path file...')
      await fs.promises.unlink(OLD_RANDO_PATH_FILE)
      return true
    }

    return false
  }
}
