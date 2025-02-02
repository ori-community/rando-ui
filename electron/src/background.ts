import { app, BrowserWindow, protocol } from 'electron'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
import * as path from 'path'
import { getElectronUrl, registerUIIpcApi, uiIpc } from './api'
import fs from 'fs'
import { SettingsService } from '~/electron/src/lib/SettingsService'
import { CrashDetectService } from '~/electron/src/lib/CrashDetectService'
import { LAUNCHER_WORKING_DIR, RANDOMIZER_BASE_PATH, SEEDS_PATH, UPDATE_PATH } from '~/electron/src/lib/Constants'
import { RandoIPCService } from '~/electron/src/lib/RandoIPCService'
import { LocalTrackerWebSocketService } from '@/lib/LocalTrackerWebSocketService'
import { LocalTrackerService } from '@/lib/LocalTrackerService'
import { ChatControlService } from '@/lib/ChatControlService'
import { BingoBoardOverlayService } from '@/lib/BingoBoardOverlayService'
import { createProtocol } from '@/lib/createProtocol'
import os from 'os'

const isDevelopment = process.env.NODE_ENV !== 'production'

let window: BrowserWindow | null = null

process.env.PLATFORM = os.platform()

/**
 * @returns {BrowserWindow}
 */
export function getWindow() {
  return window
}

async function createWindow() {
  await SettingsService.runPreSettingsMigrations()
  await SettingsService.makeSureSettingsFileExists()
  await SettingsService.runSettingsMigrations()

  registerUIIpcApi()

  // Create the browser window.
  window = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    backgroundColor: '#050e17',
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: !!(process.env.ELECTRON_NODE_INTEGRATION as unknown) as boolean,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    frame: true,
    darkTheme: true,
    show: false,
    paintWhenInitiallyHidden: true,
    title: 'Ori and the Will of the Wisps Randomizer',
  })

  window.once('ready-to-show', () => {
    window?.maximize()
  })

  window.on('close', () => {
    LocalTrackerService.close()
    ChatControlService.close()
    BingoBoardOverlayService.close()
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    // await window.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string)
    await window.loadURL(getElectronUrl('/electron'))
    if (!process.env.IS_TEST) window.webContents.openDevTools()
  } else {
    createProtocol('app')

    // Load the index.html when not in development
    await window.loadURL(getElectronUrl('/electron'))
  }

  const commandLineArgumentHandler = (args: string[]) => {
    const lastArg = args[args.length - 1]

    if (lastArg.endsWith('.wotwr') && fs.existsSync(lastArg)) {
      // We got a seed!
      uiIpc.queueSend('main.openSeed', fs.realpathSync(lastArg))
    } else {
      // Maybe a URL?
      try {
        const url = new URL(lastArg)
        if (url.protocol === 'ori-rando:') {
          uiIpc.queueSend('main.openUrl', url.toString())
        }
      } catch (e: any) {
        console.warn('Could not parse URL', e.message)
      }
    }
  }

  app.on('second-instance', (event, args) => commandLineArgumentHandler(args))
  commandLineArgumentHandler(process.argv)

  CrashDetectService.setOnCrashCallback((supportBundleName: string) => {
    uiIpc.queueSend('main.crashDetected', supportBundleName)
  })
  await CrashDetectService.start()
  await RandoIPCService.startIPCServer()
  LocalTrackerWebSocketService.start()
}

if (isDevelopment) {
  fs.mkdirSync(RANDOMIZER_BASE_PATH, { recursive: true })
  fs.mkdirSync(SEEDS_PATH, { recursive: true })
  fs.mkdirSync(UPDATE_PATH, { recursive: true })
  process.chdir(LAUNCHER_WORKING_DIR)
} else {
  fs.mkdirSync(SEEDS_PATH, { recursive: true })
  fs.mkdirSync(UPDATE_PATH, { recursive: true })
  process.chdir(LAUNCHER_WORKING_DIR)
}

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  // Scheme must be registered before the app is ready
  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'app',
      privileges: { secure: true, standard: true, supportFetchAPI: true },
    },
  ])

  app.setAsDefaultProtocolClient('ori-rando')

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', async () => {
    if (isDevelopment && !process.env.IS_TEST) {
      // Install Vue Devtools
      try {
        await installExtension(VUEJS3_DEVTOOLS)
      } catch (e) {
        console.log('Vue Devtools failed to install:', e)
      }
    }

    try {
      await createWindow()
    } catch (e) {
      console.log(e)
    }
  })

  // Exit cleanly on request from parent process in development mode.
  if (isDevelopment) {
    if (process.platform === 'win32') {
      process.on('message', (data) => {
        if (data === 'graceful-exit') {
          app.quit()
        }
      })
    } else {
      process.on('SIGTERM', () => {
        app.quit()
      })
    }
  }
}
