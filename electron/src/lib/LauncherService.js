import { SettingsService } from '~/electron/src/lib/SettingsService'
import { spawn } from 'child_process'
import fs from 'fs'
import { RandoIPCService } from '~/electron/src/lib/RandoIPCService'
import { CURRENT_SEED_PATH_FILE, RANDOMIZER_BASE_PATH } from './Constants'
import { BindingsService } from '~/electron/src/lib/BindingsService'
import { Library as FFILibrary } from 'ffi-napi'
import { UCS2String } from '~/electron/src/lib/UCS2String'
import { SeedParser } from '~/assets/lib/SeedParser'
import { uiIpc } from '~/electron/src/api'
import { isProcessRunning } from '~/electron/src/lib/isProcessRunning'
import { LocalTrackerService } from '@/lib/LocalTrackerService'
import { getOS, isOS, Platform } from '~/assets/lib/os'
import { WineService } from '@/lib/linux/WineService'


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
  if (!isOS(Platform.Windows)) {
    throw new Error('focusGameWindow is only implemented for Windows')
  }

  const user32 = new FFILibrary('user32', {
    'FindWindowW': ['long', ['string', UCS2String]],
    'SetForegroundWindow': ['bool', ['long']],
  })
  const gameWindowHandle = user32.FindWindowW(null, 'OriAndTheWilloftheWisps')
  if (gameWindowHandle) {
    console.log('Focusing game...')
    user32.SetForegroundWindow(gameWindowHandle)
  } else {
    console.log('Could not focus game. Handle not found.')
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
      uiIpc.queueSend('main.currentSeedChanged', {
        currentSeedPath: seedFilePath.trim(),
        currentSeedInfo: SeedParser.parse(await fs.promises.readFile(seedFilePath.trim(), {encoding: 'utf-8'})),
      })
    }
  }

  static async isRandomizerRunning() {
    if (!RandoIPCService.isConnected()) {
      try {
        return RandoIPCService.isConnected()
      } catch (e) {
        return false
      }
    }

    return true
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

    const settings = await SettingsService.getCurrentSettings()

    switch (getOS()) {
      case Platform.Windows:
        await this.launchWindows(settings)
        break
      case Platform.Linux:
        await this.launchLinux(settings)
        break;
    }

    if (settings['Flags.LaunchWithTracker']) {
      await LocalTrackerService.openLocalTracker()
    }
  }

  static async launchWindows(settings) {
    if (!settings['Flags.UseWinStore'] && !fs.existsSync(settings['Paths.Steam'])) {
      uiIpc.queueSend('main.goToSettings')
      throw new Error(`Steam was not found at the specified path (${settings['Paths.Steam']}). Please set it in "Launch settings" and launch again.`)
    }

    if (!fs.existsSync(`${RANDOMIZER_BASE_PATH}/Injector.exe`)) {
      throw new Error(`Injector.exe not found. Your antivirus software has probably eaten it. You might need to add an exception for it to run the randomizer.`)
    }

    if (await this.isRandomizerRunning()) {
      try {
        await RandoIPCService.emit('reload')
        focusGameWindow()
      } catch (e) {
        console.error(e)
        throw new Error('Could not load the seed in running game.\nPlease wait a few seconds if you closed the game just now.')
      }
    } else {
      //                                                    Why is windows a thing ↓
      const injectorPathWithWonkySlashes = `${RANDOMIZER_BASE_PATH.replaceAll('/', '\\')}\\Injector.exe`

      const command = settings['Flags.Dev']
        ? `start -FilePath "${injectorPathWithWonkySlashes}"`
        : `start -WindowStyle "Hidden" -FilePath "${injectorPathWithWonkySlashes}" -ArgumentList "/nowait"`

      console.log('Starting Injector with command:', command)
      spawn(command, {
        shell: 'powershell.exe',
        stdio: 'inherit',
      }).unref()

      await waitForProcess('injector.exe', 10)

      if (settings['Flags.UseWinStore']) {
        spawn('explorer.exe shell:AppsFolder\\Microsoft.Patagonia_8wekyb3d8bbwe!App', {
          shell: 'powershell.exe',
          stdio: 'inherit',
        }).unref()
        await waitForProcess('oriandthewillofthewisps-pc.exe')
      } else {
        const steamCommand = `start -FilePath "${settings['Paths.Steam']}" -ArgumentList "-applaunch", "1057090"`
        console.log('Starting game with command', steamCommand)
        spawn(steamCommand, {
          shell: 'powershell.exe',
          stdio: 'inherit',
        }).unref()
        await waitForProcess('oriwotw.exe', 60)
        focusGameWindow()
      }
    }
  }

  static async launchLinux(settings) {
    if (!fs.existsSync(settings['Paths.GameBinary'])) {
      uiIpc.queueSend('main.goToSettings')
      throw new Error(`Game binary (oriwotw.exe) was not found at the specified path (${settings['Paths.GameBinary']}). Please set it in "Launch settings" and launch again.`)
    }

    if (await this.isRandomizerRunning()) {
      try {
        await RandoIPCService.emit('reload')
      } catch (e) {
        console.error(e)
        throw new Error('Could not load the seed in running game.\nPlease wait a few seconds if you closed the game just now.')
      }

    } else {
      await WineService.checkEnvironment()
      await WineService.checkAndPreparePrefix()
      await WineService.launchGameAndDetach()
      await WineService.launchInjector()
    }
  }
}
