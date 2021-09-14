import { SettingsService } from '../lib/SettingsService'
import { spawn } from 'child_process'
import fs from 'fs'
import psList from 'ps-list'

const waitForProcess = (processName, maxTries = 20) => new Promise((resolve, reject) => {
  let tries = 0

  const check = async () => {
    tries++
    const processes = await psList()
    if (processes.some(p => p.name.toLowerCase() === processName.toLowerCase())) {
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
  static async launch(seedFilePath = null) {
    try {
      if (seedFilePath) {
        await fs.promises.writeFile('./.currentseedpath', seedFilePath.trim())
      }

      const settings = await SettingsService.readSettings()

      let command = '.\\Injector.exe'

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
    } catch (e) {
      console.error('Failed to launch randomizer:')
      console.error(e)
    }
  }
}
