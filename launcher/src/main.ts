import {app, BrowserWindow, net, protocol, nativeTheme} from "electron"
import path from "path"
// eslint-disable-next-line import/no-unresolved
import {createIPCHandler} from "electron-trpc/main"
import {appRouter} from "@launcher/api/api"
import {getLogsUserDataPath, getRandomizerUserDataPath, getUserDataPath} from "@launcher/paths"
import fs from "fs"
import {RandoIPCService} from "@launcher/services/RandoIPCService"
import {LocalTrackerWebSocketService} from "@launcher/services/LocalTrackerWebSocketService"
import log from "electron-log/main"
import os from "node:os"
import {LauncherService} from "@launcher/services/LauncherService"
import {SeedgenServerService} from "@launcher/services/SeedgenServerService"
import {LocalTrackerService} from "@launcher/services/LocalTrackerService"
import {ToolsWindowService} from "@launcher/services/ToolsWindowService"

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

  const createWindow = async () => {
    // Create user data directory
    await fs.promises.mkdir(getUserDataPath(), {recursive: true})
    await fs.promises.mkdir(getRandomizerUserDataPath(), {recursive: true})
    await fs.promises.mkdir(getLogsUserDataPath(), {recursive: true})

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

      if ((await fs.promises.stat(absolutePath)).isDirectory()) {
        absolutePath = path.join(absolutePath, "index.html")
      }

      // Fall back to top-level index.html if the requested file does not exist
      if (!fs.existsSync(absolutePath)) {
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
      icon: os.platform() === "win32"
        ? path.join(__dirname, "../resources/icon.ico")
        : path.join(__dirname, "../resources/icon.png"),
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
      },
    })

    mainWindow.on("close", () => {
      LocalTrackerService.close()
      ToolsWindowService.close()
    })

    createIPCHandler({router: appRouter, windows: [mainWindow]})

    if (process.env.NODE_ENV === "development") {
      await mainWindow.loadURL("http://localhost:3000")

      // Open the DevTools.
      mainWindow.webContents.openDevTools()
    } else {
      await mainWindow.loadURL("app://bundle/")
    }

    mainWindow.maximize()

    await RandoIPCService.startIPCServer()
    LocalTrackerWebSocketService.start()
  }

  app.on("ready", async () => {
    try {
      await createWindow()

      const commandLineArgumentHandler = async (args: string[]) => {
        const lastArg = args[args.length - 1]

        if (lastArg.endsWith(".wotwr") && fs.existsSync(lastArg)) {
          // We got a seed!
          await LauncherService.launchOrFocusRandomizer(`file:${fs.realpathSync(lastArg)}`)
        } else {
          // Maybe a URL?
          try {
            const url = new URL(lastArg)
            if (url.protocol === "ori-rando:" && url.pathname.startsWith("/")) {
              if (process.env.NODE_ENV === "development") {
                await mainWindow.loadURL(`http://localhost:3000${url.pathname}${url.search}${url.hash}`)
              } else {
                await mainWindow.loadURL(`app://bundle${url.pathname}${url.search}${url.hash}`)
              }
            }
          } catch (e: any) {
            log.error("Could not parse URL", e.message)
          }
        }
      }

      app.on("second-instance", (_event, args) => commandLineArgumentHandler(args))
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
