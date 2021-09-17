import { app, BrowserWindow, shell } from 'electron'
import fs from 'fs'
import { RANDOMIZER_BASE_PATH } from '../lib/Constants'

const JWT_PATH = `${RANDOMIZER_BASE_PATH}/.jwt`

export default {
  async startOAuthFlow(event, baseUrl) {
    if (app.isDefaultProtocolClient('ori-rando')) {
      await shell.openExternal(`${baseUrl}/login?redir=ori-rando://authenticate`)
    } else {
      const loginWindow = new BrowserWindow({
        width: 800,
        height: 600,
        autoHideMenuBar: true,
        webPreferences: {
          nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
          contextIsolation: true,
        },
      })

      await loginWindow.loadURL(`${baseUrl}/login?redir=ori-rando://authenticate`)

      return await new Promise((resolve, reject) => {
        loginWindow.on('close', reject)

        loginWindow.webContents.on('will-redirect', (event, url) => {
          url = new URL(url)

          if (url.protocol === 'ori-rando:') {
            event.preventDefault()
            resolve(url.searchParams.get('jwt'))
            loginWindow.close()
          }
        })
      })
    }
  },
  async setClientJwt(event, jwt) {
    await fs.promises.writeFile(JWT_PATH, jwt, { encoding: 'utf16le' })
  },
  async deleteClientJwt() {
    await fs.promises.unlink(JWT_PATH)
  },
}
