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
import { isOS, Platform } from '~/assets/lib/os'

const getDefaultSettings = () => {
  const localTrackerInitialWindowRect = LocalTrackerService.getInitialWindowRect()

  return {
    Paths: {
      Steam: isOS(Platform.Windows) ? 'C:\\Program Files (x86)\\Steam\\steam.exe' : '/usr/bin/steam',
      UdpPort: 31415,
      Host: 'wotw.orirando.com',
    },
    Flags: {
      UseWinStore: false,
      Dev: false,
      MuteInjectLogs: false,
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
      SelectInLogicFilterByDefault: true,
      Insecure: false,
    },
    Values: {
      MapIconTransparency: 0.25,
      CameraShakeIntensity: 1.0,
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
  await SettingsService.writeSettings()
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
        console.log(`SettingsService: Migrating from ${lastVersion} to ${currentVersion}`)

        const settings = await SettingsService.getCurrentSettings()
        const lastIsPrerelease = semver.prerelease(lastVersion)
        const currentIsPrerelease = semver.prerelease(currentVersion)

        const migrations = {
          // '1.0.0'() {
          //   ...
          // },
          '2.0.0-beta.72'() {
            if (settings['Paths.URL']) {
              settings['Paths.Host'] = settings['Paths.URL']
              delete settings['Paths.URL']
            }
          },
          '2.0.0-beta.104'() {
            if (!settings['Paths.Host']) {
              settings['Paths.Host'] = currentIsPrerelease
                ? 'dev.wotw.orirando.com'
                : 'wotw.orirando.com'
            }
          },
        }

        for (const migrationVersion of Object.keys(migrations)) {
          if (semver.gt(migrationVersion, lastVersion, true) && semver.lte(migrationVersion, currentVersion, true)) {
            console.log(`SettingsService: Running migration ${migrationVersion}`)
            migrations[migrationVersion]()
          }
        }
        console.log(`SettingsService: Migrations finished`)

        // When switching from non-beta to beta or from beta to non-beta
        if (lastIsPrerelease && !currentIsPrerelease) {
          settings['Paths.Host'] = 'wotw.orirando.com'
          settings['Paths.UdpPort'] = 31415
          settings['Flags.Dev'] = false
          settings['Flags.UpdateToPrereleaseVersions'] = false
          console.log(`SettingsService: Switching to stable server`)
        } else if (!lastIsPrerelease && currentIsPrerelease) {
          settings['Paths.Host'] = 'dev.wotw.orirando.com'
          settings['Paths.UdpPort'] = 31416
          settings['Flags.Dev'] = true
          settings['Flags.UpdateToPrereleaseVersions'] = true
          console.log(`SettingsService: Switching to dev server`)
        }

        flatSettings = settings
        await SettingsService.writeSettings()
        sendSettingsToUI()
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
    let settingsObject = getDefaultSettings()

    if (fs.existsSync(SETTINGS_PATH)) {
      const settingsIniContent = await fs.promises.readFile(SETTINGS_PATH, { encoding: 'utf16le' });
      settingsObject = merge(settingsObject, ini.parse(settingsIniContent.trimStart()))
    } else {
      console.log("Settings file not found. Using default settings.");
    }

    flatSettings = {}
    for (const leafNode of leafNodes(settingsObject)) {
      flatSettings[leafNode] = get(settingsObject, leafNode)
    }

    sendSettingsToUI()
  }

  static async getCurrentSettings() {
    if (flatSettings === null) {
      await this.readSettingsToCache()
    }

    return cloneDeep(flatSettings)
  }

  /**
   * Set a single setting (specified by `key`) to a value.
   * This will queue a settings write
   * @param key
   * @param value
   * @returns {Promise<void>}
   */
  static async setSetting(key, value) {
    const currentSettings = await this.getCurrentSettings()

    if (currentSettings[key] !== value) {
      const oldValue = currentSettings[key]
      flatSettings[key] = value
      await this.writeSettingsDebounced()
      this.events.emit('setting-changed', key, value, oldValue)
      sendSettingsToUI()
    }
  }

  /**
   * Writes settings to disk immediately
   * @returns {Promise<void>}
   */
  static async writeSettings() {
    const settingsObject = {}
    for (const [key, value] of Object.entries(flatSettings)) {
      set(settingsObject, key, value)
    }

    await fs.promises.writeFile(SETTINGS_PATH, ini.encode(settingsObject), { encoding: 'utf16le' })
  }

  /**
   * Queues a settings write, or writes immediately if the last write is >1s ago
   * @returns {Promise<void>}
   */
  static async writeSettingsDebounced() {
    await writeSettingsDebouncedImpl()
  }
}
