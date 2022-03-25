import fs from 'fs'
import ini from 'ini'
import {RANDOMIZER_BASE_PATH} from './Constants'
import path from 'path'
import merge from 'lodash.merge'
import cloneDeep from 'lodash.clonedeep'
import isEqual from 'lodash.isequal'
import updater from '~/electron/src/api/updater'
import semver from 'semver'
import {LocalTrackerService} from '@/lib/LocalTrackerService'
import {uiIpc} from '@/api.ts'
import {EventEmitter} from 'events'

const SETTINGS_PATH = `${RANDOMIZER_BASE_PATH}/settings.ini`
const CURRENT_SEED_PATH_FILE = `${RANDOMIZER_BASE_PATH}/.currentseedpath`
const LAST_VERSION_FILE = `${RANDOMIZER_BASE_PATH}/LAST_VERSION`
const OLD_RANDO_PATH_FILE = path.join(process.env.LOCALAPPDATA || '', 'wotwrpath.tmp')

const getDefaultSettings = () => {
  const localTrackerInitialWindowRect = LocalTrackerService.getInitialWindowRect()

  return {
    Paths: {
      Steam: 'C:\\Program Files (x86)\\Steam\\steam.exe',
      UdpPort: 31415,
      URL: 'wotw.orirando.com',
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
      AlwaysShowWarps: true,
      AlwaysShowKeystones: true,
      WorldMapEnabled: true,
      GrappleMouseControl: false,
      BurrowMouseControl: false,
      WaterDashMouseControl: false,
      DisableNetcode: false,
      LaunchWithTracker: false,
      UseBuiltinTracker: false,
      DisableQuestFocus: true,
      BoringMoney: true,
      WaitForDebugger: false,
      InvertSwim: false,
      DisableDebugControls: true,
      CursorLock: false,
      UpdateToPrereleaseVersions: false,
      ShowStatsAfterFinish: true,
      DisableShowSecrets: false,
      DisableAutoAim: false,
      AlwaysShowKeystoneDoors: false,
    },
    Values: {
      MapIconTransparency: 0.25
    },
    LocalTracker: {
      X: localTrackerInitialWindowRect.x,
      Y: localTrackerInitialWindowRect.y,
      Width: localTrackerInitialWindowRect.width,
      Height: localTrackerInitialWindowRect.height,
      Transparent: false,
      AlwaysOnTop: false,
      IgnoreMouse: false,
      ShowWillowHearts: false,
      HideHeartsUntilFirstHeart: false,
    },
  }
}

const sendSettingsToUI = () => {
  try {
    uiIpc.queueSend('main.settingsChanged', settingsCache)
  } catch (e) {
    console.error(e)
  }
}

let settingsCache = null
let shouldShowImportInfoDialog = false
let events = new EventEmitter()

export class SettingsService {
  static get events() {
    return events
  }

  static async migrateSettingsVersion() {
    const currentVersion = (await updater.getVersion()).trim()

    if (fs.existsSync(LAST_VERSION_FILE) && currentVersion !== 'develop') {
      const lastVersion = (await fs.promises.readFile(LAST_VERSION_FILE, {encoding: 'utf-8'})).trim()

      if (lastVersion !== currentVersion && lastVersion !== 'develop') {
        const settings = await SettingsService.getCurrentSettings()

        // When switching from non-beta to beta or from beta to non-beta
        const lastIsPrerelease = semver.prerelease(lastVersion)
        const currentIsPrerelease = semver.prerelease(currentVersion)

        if (lastIsPrerelease && !currentIsPrerelease) {
          settings.Paths.URL = 'wotw.orirando.com'
          settings.Paths.UdpPort = 31415
          settings.Flags.Dev = false
          settings.Flags.DisableDebugControls = true
        } else if (!lastIsPrerelease && currentIsPrerelease) {
          settings.Paths.URL = 'dev.wotw.orirando.com'
          settings.Paths.UdpPort = 31416
          settings.Flags.Dev = true
          settings.Flags.DisableDebugControls = false
        }

        const migrations = {
          // '1.0.0'() {
          //   ...
          // },
        }

        for (const migrationVersion of Object.keys(migrations)) {
          if (semver.gt(migrationVersion, lastVersion, true) && semver.lte(migrationVersion, currentVersion, true)) {
            console.log(`SettingsService: Running migration ${migrationVersion}`)
            migrations[migrationVersion]()
          }
        }
        console.log(`SettingsService: Migrations finished`)

        await SettingsService.setSettings(settings)
      } else {
        console.log(`SettingsService: Nothing to migrate`)
      }
    } else {
      console.log(`SettingsService: Fresh installation, nothing to migrate`)
    }

    await fs.promises.writeFile(LAST_VERSION_FILE, currentVersion)
  }

  static async makeSureSettingsFileExists() {
    await this.getCurrentSettings()
    await this.writeSettings()
  }

  static async readSettingsToCache() {
    if (!fs.existsSync(SETTINGS_PATH)) {
      console.log('Settings file not found, using default settings...')
      settingsCache = getDefaultSettings()
    } else {
      const settings = await fs.promises.readFile(SETTINGS_PATH, {encoding: 'utf16le'})

      settingsCache = merge(
        getDefaultSettings(),
        ini.parse(settings.trimStart()),
      )
    }

    sendSettingsToUI()
  }

  static async getCurrentSettings() {
    if (settingsCache === null) {
      await this.readSettingsToCache()
    }

    return settingsCache
  }

  static async setSettings(settings) {
    if (isEqual(settings, settingsCache)) {
      return
    }

    const oldSettings = cloneDeep(settingsCache)
    settingsCache = settings
    sendSettingsToUI()
    this.events.emit('settings-changed', settings, oldSettings)
    await this.writeSettings()
  }

  static async writeSettings() {
    await fs.promises.writeFile(SETTINGS_PATH, ini.encode(settingsCache), {encoding: 'utf16le'})
  }

  static async transaction(callback) {
    const currentSettings = cloneDeep(await this.getCurrentSettings())
    callback(currentSettings)
    await this.setSettings(currentSettings)
  }

  static async getOldInstallationPath() {
    const oldPathFile = OLD_RANDO_PATH_FILE
    if (!fs.existsSync(oldPathFile)) {
      console.log('SettingsService: Did not find old Rando installation')
      return null
    }

    const oldPath = (await fs.promises.readFile(oldPathFile, {encoding: 'utf-8'})).trim()
    if (!fs.existsSync(oldPath)) {
      console.log(`SettingsService: Found old Rando path file, but the target path (${oldPath}) does not exist`)
      return null
    }

    return oldPath
  }

  static async importSettingsFromOldInstallation() {
    const oldPath = await this.getOldInstallationPath()
    if (oldPath) {
      console.log('Found old Rando installation at', oldPath)

      console.log('Importing settings.ini...')
      const oldSettingsPath = path.join(oldPath, 'settings.ini')
      if (!fs.existsSync(oldSettingsPath)) {
        console.log('Could not import old settings.ini. File does not exist.')
        return false
      }
      await fs.promises.copyFile(oldSettingsPath, SETTINGS_PATH)

      if (fs.existsSync(path.join(oldPath, '.currentseedpath'))) {
        console.log('Importing .currentseedpath...')
        await fs.promises.copyFile(path.join(oldPath, '.currentseedpath'), CURRENT_SEED_PATH_FILE)
      }

      console.log('Cleaning up old rando...')
      const files = [
        'WotwRando.exe',
        'ItemTracker.exe',
        'RandoSettings.exe',
        'areas.wotw',
        'state_data.csv',
        'settings.ini',
        'loader_log.txt',
        'controller_bindings.cfg',
        'discord_game_sdk.dll',
        'headers_presets.zip',
        'Il2CppModLoader.dll',
        'InjectDLL.dll',
        'Injector.exe',
        'modloader_config.json',
        'RandoMainDLL.dll',
        'seedgen.exe',
        'VERSION',
        '.messagelog',
        'cs_log.txt',
        'inject_log.csv',
        'reach_log.txt',
        'trackfile.json',
        '.currentseedpath',
        'manager_error.log',
        'SeeGen.jar',
        'loc_data.csv',
        'rando_binds.ahk',
      ]
      for (const file of files) {
        const filePath = path.join(oldPath, file)
        if (fs.existsSync(filePath)) {
          try {
            await fs.promises.unlink(filePath)
            console.log(` - ${file} → deleted`)
          } catch (e) {
            console.log(e)
            console.log(` - ${file} → error`)
          }
        } else {
          console.log(` - ${file} → does not exist`)
        }
      }

      console.log('Deleting path file...')
      await fs.promises.unlink(OLD_RANDO_PATH_FILE)

      shouldShowImportInfoDialog = true
      return true
    }

    return false
  }

  static shouldShowImportInfoDialog() {
    const value = shouldShowImportInfoDialog
    shouldShowImportInfoDialog = false
    return value
  }
}
