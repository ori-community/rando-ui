import {app, BrowserWindow} from "electron"
import path from "path"
import {createIPCHandler} from "electron-trpc/main"
import {appRouter} from "./api/api"
import {getUserDataPath} from "./paths"
import fs from "fs"
import {RandoIPCService} from "./services/RandoIPCService"

// Override session data path to have a clean app data directory.
// Otherwise, Chromium will pollute it...
app.setPath("sessionData", path.join(app.getPath("userData"), "launcher"))

const createWindow = async () => {
  // Create user data directory
  if (!fs.existsSync(getUserDataPath())) {
    await fs.promises.mkdir(getUserDataPath(), {recursive: true})
  }

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    backgroundColor: "#050e17",
    frame: true,
    darkTheme: true,
    paintWhenInitiallyHidden: true,
    title: "Ori and the Will of the Wisps Randomizer",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  })

  createIPCHandler({router: appRouter, windows: [mainWindow]})

  await mainWindow.loadURL("http://localhost:3000")

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
  mainWindow.maximize()

  await RandoIPCService.startIPCServer()
}

app.on("ready", createWindow)

app.on("window-all-closed", () => {
  app.quit()
})
