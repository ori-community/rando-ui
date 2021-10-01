import { SettingsService } from '~/electron/src/lib/SettingsService'
import { spawn } from 'child_process'
import fs from 'fs'
import psList from 'ps-list'
import { RandoIPCService } from '~/electron/src/lib/RandoIPCService'
import { RANDOMIZER_BASE_PATH } from './Constants'
import { BindingsService } from '~/electron/src/lib/BindingsService'
import { Library as FFILibrary } from 'ffi-napi'
import { UCS2String } from '~/electron/src/lib/UCS2String'
import { BrowserWindow } from 'electron'
import { SeedParser } from '~/assets/lib/SeedParser'


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

const focusGameWindow = () => {
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

export class LauncherService {
  static getOpenedSeedPath() {
    return process.argv[1] || null
  }

  static async getCurrentSeedPath(returnNonExisting = false) {
    if (fs.existsSync(CURRENT_SEED_PATH_FILE)) {
      const path = await fs.promises.readFile(CURRENT_SEED_PATH_FILE, { encoding: 'utf-8' })

      if (returnNonExisting) {
        return path
      } else if (fs.existsSync(path)) {
        return path
      }
    }

    return null
  }

  static async getCurrentSeedInfo() {
    const path = await this.getCurrentSeedPath()
    if (path) {
      const content = await fs.promises.readFile(path, { encoding: 'utf-8' })
      return SeedParser.parse(content)
    }
    return null
  }

  static async setCurrentSeedPath(seedFilePath) {
    if (await this.getCurrentSeedPath() !== seedFilePath.trim()) {
      console.log(`Setting current seed path to ${seedFilePath.trim()}`)
      await fs.promises.writeFile(CURRENT_SEED_PATH_FILE, seedFilePath.trim())
      BrowserWindow.getFocusedWindow().webContents.send('main.currentSeedChanged', {
        currentSeedPath: seedFilePath.trim(),
        currentSeedInfo: SeedParser.parse(await fs.promises.readFile(seedFilePath.trim(), {encoding: 'utf-8'})),
      })
    }
  }

  static async launch(seedFilePath = null) {
    if (seedFilePath) {
      console.log('Launching seed', seedFilePath)
      await this.setCurrentSeedPath(seedFilePath)
    } else {
      console.log('Launching last seed')
    }

    await BindingsService.makeSureControllerBindingsFileExists()
    await BindingsService.makeSureKeyboardBindingsFileExists()
    await SettingsService.makeSureSettingsFileExists()
    const settings = await SettingsService.readSettings()

    if (!fs.existsSync(settings.Paths.Steam)) {
      BrowserWindow.getFocusedWindow().webContents.send('main.goToSettings')
      throw new Error(`Steam was not found at the specified path (${settings.Paths.Steam}). Please set it in "Launch settings" and launch again.`)
    }

    if (!fs.existsSync(`${RANDOMIZER_BASE_PATH}/Injector.exe`)) {
      throw new Error(`Injector.exe not found. Your antivirus software has probably eaten it. You might need to add an exception for it to run the randomizer.`)
    }

    if (await isProcessRunning('injector.exe')) {
      if (!await RandoIPCService.trySend('reload')) {
        throw new Error('Could not load the seed in running game.\nPlease wait a few seconds if you closed the game just now.')
      } else {
        focusGameWindow()
      }
    } else {
      //                                                    Why is windows a thing ↓
      const injectorPathWithWonkySlashes = `${RANDOMIZER_BASE_PATH.replaceAll('/', '\\')}\\Injector.exe`

      const command = settings.Flags.Dev
        ? `start -FilePath "${injectorPathWithWonkySlashes}"`
        : `start -WindowStyle "Hidden" -FilePath "${injectorPathWithWonkySlashes}" -ArgumentList "/nowait"`

      console.log('Starting Injector with command:', command)
      spawn(command, {
        shell: 'powershell.exe',
        stdio: 'inherit',
      }).unref()

      await waitForProcess('injector.exe', 10)

      if (settings.Flags.LaunchWithTracker) {
        spawn(`start -FilePath "${RANDOMIZER_BASE_PATH.replaceAll('/', '\\')}\\ItemTracker.exe"`, {
          detached: true,
          shell: 'powershell.exe',
          stdio: 'ignore',
        }).unref()
      }

      if (settings.Flags.UseWinStore) {
        spawn('explorer.exe shell:AppsFolder\\Microsoft.Patagonia_8wekyb3d8bbwe!App', {
          detached: true,
          shell: 'powershell.exe',
          stdio: 'inherit',
        }).unref()
        await waitForProcess('oriandthewillofthewisps-pc.exe')
      } else {
        const steamCommand = `start -FilePath "${settings.Paths.Steam}" -ArgumentList "-applaunch", "1057090"`
        console.log('Starting game with command', steamCommand)
        spawn(steamCommand, {
          detached: true,
          shell: 'powershell.exe',
          stdio: 'inherit',
        }).unref()
        await waitForProcess('oriwotw.exe', 60)
        focusGameWindow()
      }
    }
  }
}
