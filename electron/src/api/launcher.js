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
    console.log(item)
    await LauncherService.launch(item.path)
  },

  openWiki() {
    shell.openExternal('https://wiki.orirando.com')
  },
}
