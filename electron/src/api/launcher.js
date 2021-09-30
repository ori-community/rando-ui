import { LauncherService } from '~/electron/src/lib/LauncherService'
import { BrowserWindow, shell } from 'electron'
import { download } from 'electron-dl'
import { RANDOMIZER_BASE_PATH, SEEDS_PATH } from '~/electron/src/lib/Constants'
import path from 'path'

export default {
  getOpenedSeedPath() {
    return LauncherService.getOpenedSeedPath()
  },

  async getCurrentSeedPath() {
    return await LauncherService.getCurrentSeedPath()
  },

  async getCurrentSeedInfo() {
    return await LauncherService.getCurrentSeedInfo()
  },

  async setCurrentSeedPath(event, seedPath) {
    await LauncherService.setCurrentSeedPath(seedPath)
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
    console.log(`Launching seed from URL: ${url}`)

    const item = await download(BrowserWindow.getFocusedWindow(), url, {
      directory: SEEDS_PATH,
      filename: fileName,
    })

    console.log(`Downloaded seed to ${item.getSavePath()}`)

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

  openRandomizerDirectory() {
    shell.openPath(path.resolve(process.cwd(), RANDOMIZER_BASE_PATH))
  },

  openSeedsDirectory() {
    shell.openPath(path.resolve(process.cwd(), SEEDS_PATH))
  },

  openGitHub() {
    shell.openExternal('https://github.com/ori-rando')
  },

  openDiscord() {
    shell.openExternal('https://discord.gg/SUS57PWWnA')
  },
}
