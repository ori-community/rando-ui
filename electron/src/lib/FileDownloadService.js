import axios from 'axios'
import fs from 'fs'

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
}
