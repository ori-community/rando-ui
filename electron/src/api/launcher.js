import { LauncherService } from '../lib/LauncherService'
import { BrowserWindow, shell } from 'electron'
import { download } from 'electron-dl'
import { RandoIPCService } from '~/electron/src/lib/RandoIPCService'

export default {
  getOpenedSeedPath() {
    return LauncherService.getOpenedSeedPath()
  },

  async launch(event, seedPath = null) {
    try {
      await LauncherService.launch(seedPath)
    } catch (e) {
      console.error('Failed to launch:', e)
      event.sender.send('main.error', e)
    }
  },

  async launchSeedFromUrl(event, { url, fileName }) {
    const item = await download(BrowserWindow.getFocusedWindow(), url, {
      filename: fileName,
    })

    try {
      await LauncherService.launch(item.getSavePath())
    } catch (e) {
      console.error('Failed to launch:', e)
      event.sender.send('main.error', e)
    }
  },

  openWiki() {
    shell.openExternal('https://wiki.orirando.com')
  },
}
