import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { shell } from 'electron'
import { LauncherService } from '~/electron/src/lib/LauncherService'
import { SEEDS_PATH } from '~/electron/src/lib/Constants'

export class FileDownloadService {
  static async download(url, targetFile, progressCallback = () => {}) {
    const { data, headers } = await axios.get(url, {
      responseType: 'stream',
    })

    const total = Number(headers['content-length'] || 0)

    const writeStream = fs.createWriteStream(targetFile)
    data.pipe(writeStream)

    await new Promise((resolve, reject) => {
      let progress = 0

      data.on('data', chunk => {
        progress += chunk.length
        progressCallback(progress, total)
      })

      data.on('error', error => {
        reject(error)
      })

      writeStream.on('error', error => {
        reject(error)
      })

      writeStream.on('close', () => {
        resolve()
      })
    })
  }

  static async downloadSeedFromUrl(url, fileName, setToCurrent = true, showInExplorer = false) {
    console.log(`Downloading seed from URL: ${url}`)

    const originalFilenameParts = fileName.match(/(?<name>.*)\.(?<extension>[^.]*)/).groups
    let count = 1
    while (fs.existsSync(path.join(SEEDS_PATH, fileName))) {
      fileName = `${originalFilenameParts.name}_${count++}.${originalFilenameParts.extension}`
    }

    const targetFile = path.join(SEEDS_PATH, fileName)
    await FileDownloadService.download(url, targetFile)

    console.log(`Downloaded seed to ${targetFile}`)

    if (setToCurrent) {
      await LauncherService.setNewGameSeedSource(`file:${targetFile}`)
    }

    if (showInExplorer) {
      shell.showItemInFolder(targetFile)
    }

    return targetFile
  }

  static async downloadSeedsFromUrl(seeds, showInExplorer = false) {
    let firstSeedFile = null
    for (const seed of seeds) {
      const targetFile = await this.downloadSeedFromUrl(seed.url, seed.fileName, false)

      if (!firstSeedFile) {
        firstSeedFile = targetFile
      }
    }

    if (showInExplorer && firstSeedFile) {
      shell.showItemInFolder(firstSeedFile)
    }
  }
}
