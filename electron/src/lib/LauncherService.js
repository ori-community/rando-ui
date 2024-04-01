import { SettingsService } from '~/electron/src/lib/SettingsService'
import { spawn } from 'child_process'
import fs from 'fs'
import { RandoIPCService } from '~/electron/src/lib/RandoIPCService'
import { NEW_GAME_SEED_SOURCE_FILE, RANDOMIZER_BASE_PATH } from './Constants'
import { BindingsService } from '~/electron/src/lib/BindingsService'
import { uiIpc } from '~/electron/src/api'
import { isProcessRunning } from '~/electron/src/lib/isProcessRunning'
import { LocalTrackerService } from '@/lib/LocalTrackerService'
import { getOS, Platform } from '~/assets/lib/os'
import { WineService } from '@/lib/linux/WineService'


const waitForProcess = (processName, maxTries = 20) => new Promise((resolve, reject) => {
  let tries = 0

  const check = async () => {
    tries++

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

const focusGameWindow = async () => {
  await RandoIPCService.emit('focus_game_window')
}

export class LauncherService {
  static getOpenedSeedPath() {
    return process.argv[1] || null
  }

  static async getNewGameSeedSource(returnNonExisting = false) {
    if (fs.existsSync(NEW_GAME_SEED_SOURCE_FILE)) {
      const path = await fs.promises.readFile(NEW_GAME_SEED_SOURCE_FILE, { encoding: 'utf-8' })

      if (returnNonExisting) {
        return path
      } else if (fs.existsSync(path)) {
        return path
      }
    }

    return null
  }

  static async setNewGameSeedSource(newGameSeedSource) {
    if (await this.getNewGameSeedSource() !== newGameSeedSource.trim()) {
      console.log(`Setting new game seed source to ${newGameSeedSource.trim()}`)
      await fs.promises.writeFile(NEW_GAME_SEED_SOURCE_FILE, newGameSeedSource.trim())
      uiIpc.queueSend('main.newGameSeedSourceChanged', {
        newGameSeedSource: newGameSeedSource.trim(),
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

  static async launch(newGameSeedSource = null) {
    if (newGameSeedSource) {
      console.log('Launching source', newGameSeedSource)
      await this.setNewGameSeedSource(newGameSeedSource)
    } else {
      console.log('Launching last seed')
    }

    await BindingsService.makeSureControllerBindingsFileExists()
    await BindingsService.makeSureKeyboardBindingsFileExists()
    await SettingsService.makeSureSettingsFileExists()

    const settings = await SettingsService.getCurrentSettings()

    const wasRunning = await LauncherService.isRandomizerRunning()

    switch (getOS()) {
      case Platform.Windows:
        await this.launchWindows(settings)
        break
      case Platform.Linux:
        await this.launchLinux(settings)
        break;
    }

    if (!wasRunning && settings['Flags.LaunchWithTracker']) {
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
