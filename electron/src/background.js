'use strict'

import { app, BrowserWindow, protocol } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
import * as path from 'path'
import { registerUIIpcApi, uiIpc } from './api.js'
import fs from 'fs'
import { SettingsService } from '~/electron/src/lib/SettingsService'
import { CrashDetectService } from '~/electron/src/lib/CrashDetectService'
import { SEEDS_PATH, UPDATE_PATH } from '~/electron/src/lib/Constants'

const isDevelopment = process.env.NODE_ENV !== 'production'

let window = null

/**
 * @returns {BrowserWindow}
 */
export function getWindow() {
  return window
}

async function createWindow() {
  registerUIIpcApi()

  if (await SettingsService.importSettingsFromOldInstallation()) {
    console.log('Successfully imported old settings.')
  }

  // Create the browser window.
  window = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    backgroundColor: '#050e17',
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    frame: true,
    show: false,
    title: 'Ori and the Will of the Wisps Randomizer',
  })

  window.maximize()
  window.show()

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    // await window.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    await window.loadURL('http://localhost:3000/electron')
    if (!process.env.IS_TEST) window.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    await window.loadURL('app://./index.html#/electron')
  }

  const commandLineArgumentHandler = (args) => {
    const lastArg = args[args.length - 1]

    if (lastArg.endsWith('.wotwr') && fs.existsSync(lastArg)) {
      // We got a seed!
      uiIpc.queueSend('main.openSeed', lastArg)
    } else {
      // Maybe an URL?
      try {
        const url = new URL(lastArg)
        if (url.protocol === 'ori-rando:') {
          uiIpc.queueSend('main.openUrl', url.toString())
        }
      } catch (e) {
        console.warn('Could not parse URL', e)
      }
    }
  }

  app.on('second-instance', (event, args) => commandLineArgumentHandler(args))
  commandLineArgumentHandler(process.argv)

  CrashDetectService.setOnCrashCallback(supportBundleName => {
    uiIpc.queueSend('main.crashDetected', supportBundleName)
  })
  await CrashDetectService.start()
  await SettingsService.migrateSettingsVersion()
}

if (isDevelopment) {
  fs.mkdirSync('./work-dir/randomizer', {recursive: true})
  fs.mkdirSync('./work-dir/seeds', {recursive: true})
  fs.mkdirSync('./work-dir/update', {recursive: true})
  process.chdir('./work-dir')
} else {
  process.chdir(path.dirname(process.argv0))
  fs.mkdirSync(SEEDS_PATH, {recursive: true})
  fs.mkdirSync(UPDATE_PATH, {recursive: true})
}

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  // Scheme must be registered before the app is ready
  protocol.registerSchemesAsPrivileged([
    { scheme: 'app', privileges: { secure: true, standard: true } },
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
        console.log('Vue Devtools failed to install:', e.toString())
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
