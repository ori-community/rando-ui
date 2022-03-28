import fs from 'fs'
import { app } from 'electron'
import { spawn } from 'child_process'
import { RANDOMIZER_BASE_PATH, UPDATE_PATH } from '~/electron/src/lib/Constants'
import { FileDownloadService } from '~/electron/src/lib/FileDownloadService'
import path from 'path'
import throttle from 'lodash.throttle'

const VERSION_FILE = `${RANDOMIZER_BASE_PATH}/VERSION`

export default {
  async getVersion() {
    if (!fs.existsSync(VERSION_FILE)) {
      return 'develop'
    }

    return (await fs.promises.readFile(VERSION_FILE, { encoding: 'utf-8' })).trim()
  },
  async downloadAndInstallUpdate(event, { url }) {
    const targetPath = path.join(UPDATE_PATH, 'WotwRandoUpdate.exe')
    await FileDownloadService.download(url, targetPath, throttle((progress, total) => {
      try {
        // Sometimes the sender object is already destroyed because we quit the application already...
        event.sender.send('updater.downloadProgress', progress / total)
      } catch (e) {
        console.error(e)
      }
    }, 100))

    console.log('Spawning process: ', targetPath)
    spawn(`${targetPath}`, ['/SILENT'], {
      detached: true,
      stdio: 'ignore',
    }).unref()
    app.quit()
    process.exit()
  },
}
