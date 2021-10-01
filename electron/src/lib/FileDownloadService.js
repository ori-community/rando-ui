import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { SEEDS_PATH } from '~/electron/src/lib/Constants'

export class FileDownloadService {
  static async download(url, targetFile, progressCallback = () => {}) {
    const { data, headers } = await axios.get(url, {
      responseType: 'stream',
    })

    const total = Number(headers['content-length'] || 0)

    data.pipe(fs.createWriteStream(targetFile))

    await new Promise((resolve, reject) => {
      let progress = 0

      data.on('data', chunk => {
        progress += chunk.length
        progressCallback(progress, total)
      })

      data.on('error', error => {
        reject(error)
      })

      data.on('close', () => {
        resolve()
      })
    })
  }
}
