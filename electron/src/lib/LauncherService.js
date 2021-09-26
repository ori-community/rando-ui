import { SettingsService } from '~/electron/src/lib/SettingsService'
import { spawn } from 'child_process'
import fs from 'fs'
import psList from 'ps-list'
import { RandoIPCService } from '~/electron/src/lib/RandoIPCService'
import { RANDOMIZER_BASE_PATH } from './Constants'
import { BindingsService } from '~/electron/src/lib/BindingsService'
import { Library as FFILibrary } from 'ffi-napi'
import { UCS2String } from '~/electron/src/lib/UCS2String'


const CURRENT_SEED_PATH_FILE = `${RANDOMIZER_BASE_PATH}/.currentseedpath`

const isProcessRunning = async (processName) => {
  const processes = await psList({ all: true })
  return processes.some(p => p.name.toLowerCase() === processName.toLowerCase())
}

const waitForProcess = (processName, maxTries = 20) => new Promise((resolve, reject) => {
  let tries = 0

  const check = async () => {
    tries++

    console.log(processName, await isProcessRunning(processName))

    if (await isProcessRunning(processName)) {
      resolve()
    } else if (tries > maxTries) {
      reject(new Error(`Could not find process ${processName} within ${maxTries} seconds`))
    } else {
      setTimeout(check, 1000)
    }
  }
  check()
})

export class LauncherService {
  static getOpenedSeedPath() {
    return process.argv[1] || null
  }

  static async getCurrentSeedPath() {
    if (fs.existsSync(CURRENT_SEED_PATH_FILE)) {
      return await fs.promises.readFile(CURRENT_SEED_PATH_FILE, {encoding: 'utf-8'})
    }

    return null
  }

  static async launch(seedFilePath = null) {
    if (seedFilePath) {
      console.log('Launching seed', seedFilePath)
      await fs.promises.writeFile(CURRENT_SEED_PATH_FILE, seedFilePath.trim())
    } else {
      console.log('Launching last seed')
    }

    await BindingsService.makeSureControllerBindingsFileExists()
    await BindingsService.makeSureKeyboardBindingsFileExists()
    await SettingsService.makeSureSettingsFileExists()
    const settings = await SettingsService.readSettings()

    if (await isProcessRunning('injector.exe')) {
      if (!await RandoIPCService.trySend('reload')) {
        throw new Error('Could not load the seed in running game.\nPlease wait a few seconds if you closed the game just now.')
      } else {
        const user32 = new FFILibrary('user32', {
          'FindWindowW': ['long', ['string', UCS2String]],
          'SetForegroundWindow': ['bool', ['long']],
        })
        const gameWindowHandle = user32.FindWindowW(null, 'OriAndTheWilloftheWisps')
        if (gameWindowHandle) {
          console.log('Focusing game...')
          user32.SetForegroundWindow(gameWindowHandle)
        } else {
          console.log('Could not focud game. Handle not found.')
        }
      }
    } else {
      //                Why is windows a thing ↓
      let command = `${RANDOMIZER_BASE_PATH.replaceAll('/', '\\')}\\Injector.exe`

      if (!settings.Flags.Dev) {
        console.log('Starting Injector hidden')
        command = `start -WindowStyle "Hidden" -FilePath "${command}" -ArgumentList "/nowait"`
      }

      spawn(command, {
        shell: 'powershell.exe',
        stdio: 'inherit',
      }).unref()

      await waitForProcess('injector.exe', 10)

      if (settings.Flags.LaunchWithTracker) {
        spawn(`${RANDOMIZER_BASE_PATH.replaceAll('/', '\\')}\\ItemTracker.exe`, {
          detached: true,
          shell: true,
          stdio: 'ignore',
        }).unref()
      }

      if (settings.Flags.UseWinStore) {
        spawn('explorer.exe shell:AppsFolder\\Microsoft.Patagonia_8wekyb3d8bbwe!App', {
          detached: true,
          shell: true,
          stdio: 'ignore',
        }).unref()
        await waitForProcess('oriandthewillofthewisps-pc.exe')
      } else {
        if (!fs.existsSync(settings.Paths.Steam)) {
          throw new Error(`Steam was not found at the specified path (${settings.Paths.Steam})`)
        }

        spawn(`"${settings.Paths.Steam}" -applaunch 1057090`, {
          detached: true,
          shell: true,
          stdio: 'ignore',
        }).unref()
        await waitForProcess('oriwotw.exe', 60)
      }
    }
  }
}
