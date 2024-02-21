import fs from 'fs'
import { RANDOMIZER_BASE_PATH } from '@/lib/Constants'

const VERSION_FILE = `${RANDOMIZER_BASE_PATH}/VERSION`

export class VersionService {
  static async getVersion() {
    if (!fs.existsSync(VERSION_FILE)) {
      return 'develop'
    }

    return (await fs.promises.readFile(VERSION_FILE, { encoding: 'utf-8' })).trim()
  }
}
