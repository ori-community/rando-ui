import { LauncherService } from '~/electron/src/lib/LauncherService'
import { RANDOMIZER_BASE_PATH, SEEDS_PATH } from '~/electron/src/lib/Constants'
import path from 'path'
import fs from 'fs'
import { FileDownloadService } from '~/electron/src/lib/FileDownloadService'
import { shell } from 'electron'
import { getWindow } from '~/electron/src/background'

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
      console.log('Failed to launch:', e)
      event.sender.send('main.error', e)
    }
  },

  async launchSeedFromUrl(event, { url, fileName }) {
    console.log(`Launching seed from URL: ${url}`)

    const originalFilenameParts = fileName.match(/(?<name>.*)\.(?<extension>[^.]*)/).groups
    let count = 1
    while (fs.existsSync(path.join(SEEDS_PATH, fileName))) {
      fileName = `${originalFilenameParts.name}_${count++}.${originalFilenameParts.extension}`
    }

    const targetFile = path.join(SEEDS_PATH, fileName)
    await FileDownloadService.download(url, targetFile)

    console.log(`Downloaded seed to ${targetFile}`)

    try {
      await LauncherService.launch(targetFile)
    } catch (e) {
      console.log('Failed to launch:', e)
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

  focusMainWindow() {
    getWindow().focus()
  }
}
