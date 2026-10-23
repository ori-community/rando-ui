import fs from "fs"
import os from "node:os"
import path from "path"

import {appRouter} from "@launcher/api/api"
import {
  getLogsUserDataPath,
  getClientUserDataPath,
  getSeedsUserDataPath,
  getTemporaryUserDataPath,
  getUserDataPath, getPlandosUserDataPath,
} from "@launcher/paths"
import {LauncherService} from "@launcher/services/LauncherService"
import {LocalTrackerService} from "@launcher/services/LocalTrackerService"
import {LocalTrackerWebSocketService} from "@launcher/services/LocalTrackerWebSocketService"
import {RandoIPCService} from "@launcher/services/RandoIPCService"
import {SupportBundleService} from "@launcher/services/SupportBundleService"
import {ToolsWindowService} from "@launcher/services/ToolsWindowService"
import {DEFAULT_PROTOCOL} from "@shared/utils/protocol"
import {app, BrowserWindow, net, protocol} from "electron"
import {shell} from "electron"
import log from "electron-log/main"
// eslint-disable-next-line import/no-unresolved
import {createIPCHandler} from "electron-trpc/main"

if (process.env.WOTW_RANDOMIZER_APPIMAGE_ROOT) {
  process.chdir(process.env.WOTW_RANDOMIZER_APPIMAGE_ROOT)
}

// Override session data path to have a clean app data directory.
// Otherwise, Chromium will pollute it...
app.setPath("sessionData", path.join(app.getPath("userData"), "launcher"))

log.transports.file.resolvePathFn = () => getUserDataPath("logs/launcher.log")

let mainWindow: BrowserWindow | null = null

export function getMainWindow(): BrowserWindow | null {
  return mainWindow
}

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: "app",
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        stream: true,
      },
    },
  ])

  if (import.meta.env.DEV) {
    app.setAsDefaultProtocolClient(DEFAULT_PROTOCOL)
  }

  const createWindow = async () => {
    if (fs.existsSync(getTemporaryUserDataPath())) {
      try {
        await fs.promises.rm(getTemporaryUserDataPath(), {
          recursive: true,
          force: true,
        })
      } catch (e) {
        log.error("Main: Failed to delete temporary user directory:", e)
      }
    }

    // Create user data directory
    await fs.promises.mkdir(getUserDataPath(), {recursive: true})
    await fs.promises.mkdir(getClientUserDataPath(), {recursive: true})
    await fs.promises.mkdir(getLogsUserDataPath(), {recursive: true})
    await fs.promises.mkdir(getSeedsUserDataPath(), {recursive: true})
    await fs.promises.mkdir(getTemporaryUserDataPath(), {recursive: true})
    await fs.promises.mkdir(getPlandosUserDataPath(), {recursive: true})

    const webBuildBasePath = path.normalize(path.join(__dirname, "../../web-build/"))
    protocol.handle("app", async (request) => {
      let url = new URL(request.url)

      if (url.hostname !== "bundle") {
        return new Response("Not found", {
          status: 404,
        })
      }

      let absolutePath = path.normalize(path.join(webBuildBasePath, url.pathname))

      if (!absolutePath.startsWith(webBuildBasePath)) {
        return new Response("Not found (escaped bundle)", {
          status: 404,
        })
      }

      let targetExists = fs.existsSync(absolutePath)

      if (targetExists && (await fs.promises.stat(absolutePath)).isDirectory()) {
        absolutePath = path.join(absolutePath, "index.html")
        targetExists = fs.existsSync(absolutePath)
      }

      // Fall back to top-level index.html if the requested file does not exist
      if (!targetExists) {
        absolutePath = path.join(webBuildBasePath, "index.html")
      }

      return net.fetch(`file://${absolutePath}`)
    })

    // Create the browser window.
    mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      show: false,
      backgroundColor: "#050e17",
      frame: true,
      darkTheme: true,
      paintWhenInitiallyHidden: true,
      title: "Ori and the Will of the Wisps Randomizer",
      icon:
        os.platform() === "win32"
          ? path.join(__dirname, "../resources/icon.ico")
          : path.join(__dirname, "../resources/icon.png"),
      webPreferences: {
        preload: path.join(__dirname, "preload.cjs"),
      },
    })

    mainWindow.webContents.on("will-navigate", (event) => {
      if (!event.url.startsWith("app://bundle")) {
        event.preventDefault()
        shell.openExternal(event.url)
      }
    })

    mainWindow.on("close", () => {
      LocalTrackerService.close()
      ToolsWindowService.close()
    })

    createIPCHandler({router: appRouter, windows: [mainWindow]})

    if (import.meta.env.DEV) {
      await mainWindow.loadURL("http://localhost:3000/electron")

      // Open the DevTools.
      mainWindow.webContents.openDevTools()
    } else {
      await mainWindow.loadURL("app://bundle/electron")
    }

    mainWindow.maximize()

    await RandoIPCService.startIPCServer()
    LocalTrackerWebSocketService.start()
    await SupportBundleService.instance.start()
  }

  app.on("ready", async () => {
    try {
      await createWindow()

      const commandLineArgumentHandler = async (args: string[], focus: boolean = false) => {
        const lastArg = args[args.length - 1]

        if (focus) {
          mainWindow?.focus()
        }

        if (lastArg.endsWith(".wotwr") && fs.existsSync(lastArg)) {
          // We got a seed!
          await LauncherService.launchOrFocusRandomizer(`file:${fs.realpathSync(lastArg)}`)
        } else {
          // Maybe a URL?
          try {
            const url = new URL(lastArg)
            if (url.protocol === `${DEFAULT_PROTOCOL}:` && url.pathname.startsWith("/")) {
              if (import.meta.env.DEV) {
                await mainWindow?.loadURL(`http://localhost:3000${url.pathname}${url.search}${url.hash}`)
              } else {
                await mainWindow?.loadURL(`app://bundle${url.pathname}${url.search}${url.hash}`)
              }
            }
          } catch (e: any) {
            log.error("Could not parse URL:", e.message)
          }
        }
      }

      app.on("second-instance", (_event, args) => commandLineArgumentHandler(args, true))
      await commandLineArgumentHandler(process.argv)
    } catch (e) {
      console.error(e)
      app.quit()
    }
  })

  app.on("quit", () => {
    RandoIPCService.stopIPCServerIfStarted()
  })

  app.on("window-all-closed", () => {
    app.quit()
  })
}
