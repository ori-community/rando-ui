import { SettingsService } from '../lib/SettingsService'
import { spawn } from 'child_process'
import fs from 'fs'
import psList from 'ps-list'
import { RandoIPCService } from '../lib/RandoIPCService'
import { RANDOMIZER_BASE_PATH } from './Constants'
import { BindingsService } from '../lib/BindingsService'


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

  static async launch(seedFilePath = null) {
    if (seedFilePath) {
      console.log('Launching seed', seedFilePath)
      await fs.promises.writeFile(`${RANDOMIZER_BASE_PATH}/.currentseedpath`, seedFilePath.trim())
    } else {
      console.log('Launching last seed')
    }

    await BindingsService.makeSureControllerBindingsFileExists()
    await BindingsService.makeSureKeyboardBindingsFileExists()
    await SettingsService.makeSureSettingsFileExists()
    const settings = await SettingsService.readSettings()

    if (await isProcessRunning('injector.exe')) {
      await RandoIPCService.trySend('reload')
    } else {
      //                Why is windows a thing ↓
      let command = `${RANDOMIZER_BASE_PATH.replaceAll('/', '\\')}\\Injector.exe`

      if (!settings.Flags.Dev) {
        console.log('Starting Injector hidden')
        command = 'start /b /min ' + command
      }

      // FIXME: Hiding the window does not work due to a node bug (?)
      spawn(command, {
        detached: true,
        shell: true,
        stdio: 'ignore',
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
