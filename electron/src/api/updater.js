import { app } from 'electron'
import { spawn } from 'child_process'
import { UPDATE_PATH } from '~/electron/src/lib/Constants'
import { FileDownloadService } from '~/electron/src/lib/FileDownloadService'
import path from 'path'
import throttle from 'lodash.throttle'
import { VersionService } from '@/lib/VersionService'

export default {
  async getVersion() {
    return await VersionService.getVersion()
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

    app.on('quit', () => {
      console.log('Spawning process: ', targetPath)
      spawn(`${targetPath}`, ['/SILENT'], {
        detached: true,
        stdio: 'ignore',
      }).unref()
    })
    app.quit()
  },
}
