import { LauncherService } from '../lib/LauncherService'
import { app, BrowserWindow, shell } from 'electron'
import { download } from 'electron-dl'
import { spawn } from 'child_process'

export default {
  getOpenedSeedPath() {
    return LauncherService.getOpenedSeedPath()
  },

  async launch(event, seedPath = null) {
    await LauncherService.launch(seedPath)
  },

  async launchSeedFromUrl(event, { url, fileName }) {
    const item = await download(BrowserWindow.getFocusedWindow(), url, {
      filename: fileName,
    })

    await new Promise(((resolve, reject) => {
      item.once('done', (event, state) => {
        if (state === 'completed') {
          resolve()
        } else {
          reject(new Error(`Error while downloading seed file. State = ${state}`))
        }
      })
    }))

    await LauncherService.launch(item.getSavePath())
  },

  openWiki() {
    shell.openExternal('https://wiki.orirando.com')
  },
}
