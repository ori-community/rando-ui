import fs from 'fs'
import ini from 'ini'
import { RANDOMIZER_BASE_PATH } from '../lib/Constants'

const SETTINGS_PATH = `${RANDOMIZER_BASE_PATH}/settings.ini`
const JWT_PATH = `${RANDOMIZER_BASE_PATH}/.jwt`
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

export default {
  async readSettings() {
    if (!fs.existsSync(SETTINGS_PATH)) {
      settingsCache = getDefaultSettings()
    } else {
      settingsCache = {
        ...getDefaultSettings(),
        //                                                                         ↓ AUTOHOTKEY WHYYYYYYYYYYYYYYYYY
        ...ini.parse(await fs.promises.readFile(SETTINGS_PATH, { encoding: 'utf16le' })),
      }
    }

    return settingsCache
  },
  async setSettings(event, settings) {
    settingsCache = settings
  },
  async writeSettings() {
    await fs.promises.writeFile(SETTINGS_PATH, ini.encode(settingsCache), { encoding: 'utf16le' })
  },
  async setClientJwt(event, jwt) {
    await fs.promises.writeFile(JWT_PATH, jwt, { encoding: 'utf16le' })
  },
}
