import { LauncherService } from '../lib/LauncherService'
import { BrowserWindow, shell } from 'electron'
import { download } from 'electron-dl'

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

    await LauncherService.launch(item.getSavePath())
  },

  openWiki() {
    shell.openExternal('https://wiki.orirando.com')
  },
}
