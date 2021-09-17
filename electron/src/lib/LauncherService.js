import { SettingsService } from '../lib/SettingsService'
import { spawn } from 'child_process'
import fs from 'fs'
import psList from 'ps-list'
import { RandoIPCService } from '../lib/RandoIPCService'
import { RANDOMIZER_BASE_PATH } from '~/electron/src/lib/Constants'


const isProcessRunning = async (processName) => {
  const processes = await psList()
  return processes.some(p => p.name.toLowerCase() === processName.toLowerCase())
}

const waitForProcess = (processName, maxTries = 20) => new Promise((resolve, reject) => {
  let tries = 0

  const check = async () => {
    tries++

    if (await isProcessRunning(processName)) {
      resolve()
    } else if (tries > maxTries) {
      reject()
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
    try {
      if (seedFilePath) {
        await fs.promises.writeFile(`${RANDOMIZER_BASE_PATH}/.currentseedpath`, seedFilePath.trim())
      }

      const settings = await SettingsService.readSettings()

      if (await isProcessRunning('injector.exe')) {
        await RandoIPCService.trySend('reload')
      } else {
        //                Why is windows a thing ↓
        let command = `${RANDOMIZER_BASE_PATH.replaceAll('/', '\\')}\\Injector.exe`

        if (!settings.Flags.Dev) {
          console.log('Starting Injector hidden')
          command = 'start /p ' + command
        }

        spawn(command, {
          detached: true,
          shell: true,
          stdio: 'ignore',
          windowsHide: true,
        })

        await waitForProcess('injector.exe')

        if (settings.Flags.UseWinStore) {
          spawn('explorer.exe shell:AppsFolder\\Microsoft.Patagonia_8wekyb3d8bbwe!App', {
            detached: true,
            shell: true,
            stdio: 'ignore',
          }).unref()
          await waitForProcess('oriandthewillofthewisps-pc.exe')
        } else {
          spawn(`${settings.Paths.Steam} -applaunch 1057090`, {
            detached: true,
            shell: true,
            stdio: 'ignore',
          }).unref()
          await waitForProcess('oriwotw.exe', 60)
        }
      }
    } catch (e) {
      console.error('Failed to launch randomizer:')
      console.error(e)
    }
  }
}
