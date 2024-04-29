import { app, BrowserWindow } from 'electron'
import path from 'path'

const createWindow = async () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    backgroundColor: '#050e17',
    frame: true,
    darkTheme: true,
    paintWhenInitiallyHidden: true,
    title: 'Ori and the Will of the Wisps Randomizer',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  await mainWindow.loadURL('http://localhost:3000')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  mainWindow.maximize()
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  app.quit()
})
