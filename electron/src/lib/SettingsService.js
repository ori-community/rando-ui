import fs from 'fs'
import ini from 'ini'
import { LAST_VERSION_FILE, SETTINGS_PATH } from './Constants'
import merge from 'lodash.merge'
import cloneDeep from 'lodash.clonedeep'
import debounce from 'lodash.debounce'
import updater from '~/electron/src/api/updater'
import semver from 'semver'
import { LocalTrackerService } from '@/lib/LocalTrackerService'
import { uiIpc } from '@/api.ts'
import { EventEmitter } from 'events'
import { get, leafNodes, set } from '@irrelon/path'

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
      Insecure: false,
    },
    Values: {
      MapIconTransparency: 0.25,
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
    uiIpc.queueSend('main.settingsChanged', flatSettings)
  } catch (e) {
    console.error(e)
  }
}

const writeSettingsDebouncedImpl = debounce(async () => {
  const settingsObject = {}
  for (const [key, value] of Object.entries(flatSettings)) {
    set(settingsObject, key, value)
  }

  await fs.promises.writeFile(SETTINGS_PATH, ini.encode(settingsObject), { encoding: 'utf16le' })
}, 1000)

let flatSettings = null
let events = new EventEmitter()

export class SettingsService {
  static get events() {
    return events
  }

  static async migrateSettingsVersion() {
    const currentVersion = (await updater.getVersion()).trim()

    if (fs.existsSync(LAST_VERSION_FILE) && currentVersion !== 'develop') {
      const lastVersion = (await fs.promises.readFile(LAST_VERSION_FILE, { encoding: 'utf-8' })).trim()

      if (lastVersion !== currentVersion && lastVersion !== 'develop') {
        const settings = await SettingsService.getCurrentSettings()

        // When switching from non-beta to beta or from beta to non-beta
        const lastIsPrerelease = semver.prerelease(lastVersion)
        const currentIsPrerelease = semver.prerelease(currentVersion)

        if (lastIsPrerelease && !currentIsPrerelease) {
          settings['Paths.URL'] = 'wotw.orirando.com'
          settings['Paths.UdpPort'] = 31415
          settings['Flags.Dev'] = false
          settings['Flags.DisableDebugControls'] = true
        } else if (!lastIsPrerelease && currentIsPrerelease) {
          settings['Paths.URL'] = 'dev.wotw.orirando.com'
          settings['Paths.UdpPort'] = 31416
          settings['Flags.Dev'] = true
          settings['Flags.DisableDebugControls'] = false
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
      flatSettings = getDefaultSettings()
    } else {
      const settings = await fs.promises.readFile(SETTINGS_PATH, { encoding: 'utf16le' })

      const settingsObject = merge(
        getDefaultSettings(),
        ini.parse(settings.trimStart()),
      )

      flatSettings = {}
      for (const leafNode of leafNodes(settingsObject)) {
        flatSettings[leafNode] = get(settingsObject, leafNode)
      }
    }

    sendSettingsToUI()
  }

  static async getCurrentSettings() {
    if (flatSettings === null) {
      await this.readSettingsToCache()
    }

    return cloneDeep(flatSettings)
  }

  static async setSetting(key, value) {
    const currentSettings = await this.getCurrentSettings()

    if (currentSettings[key] !== value) {
      const oldValue = currentSettings[key]
      flatSettings[key] = value
      await this.writeSettingsDebounced()
      this.events.emit('setting-changed', key, value, oldValue)
    }
  }

  static async writeSettingsDebounced() {
    await writeSettingsDebouncedImpl()
  }
}
