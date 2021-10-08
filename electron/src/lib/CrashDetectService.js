import fs from 'fs'
import Zip from 'adm-zip'
import { RANDOMIZER_BASE_PATH } from '~/electron/src/lib/Constants'
import path from 'path'
import { LauncherService } from '~/electron/src/lib/LauncherService'

const CRASH_DUMPS_PATH = `${process.env.LOCALAPPDATA || '.'}/Temp/Moon Studios/OriAndTheWilloftheWisps/Crashes`
const CRASH_ZIP_PATH = `${RANDOMIZER_BASE_PATH}/support-bundles`

export class CrashDetectService {
  constructor() {
    this.onCrashCallback = null
    this.availableCrashDumpDirectories = []
  }

  static async start() {
    if (!fs.existsSync(CRASH_ZIP_PATH)) {
      await fs.promises.mkdir(CRASH_ZIP_PATH, { recursive: true })
    }

    this.availableCrashDumpDirectories = await this.getAvailableCrashDumpDirectories()

    console.log(`CrashDetectService: Found ${this.availableCrashDumpDirectories.length} existing crash dump(s)`)

    setInterval(async () => {
      const foundCrashDumpDirectories = await this.getAvailableCrashDumpDirectories()

      try {
        for (const crashDirectory of foundCrashDumpDirectories) {
          if (
            !this.availableCrashDumpDirectories.includes(crashDirectory) &&
            fs.existsSync(`${CRASH_DUMPS_PATH}/${crashDirectory}/crash.dmp`)
          ) {
            console.log(`CrashDetectService: New crash dump detected: ${crashDirectory}`)
            this.availableCrashDumpDirectories.push(crashDirectory)
            const supportBundleName = await this.createSupportBundle(crashDirectory)
            this.onCrashCallback && this.onCrashCallback(supportBundleName)
            break
          }
        }
      } catch (e) {
        console.error(e)
      }
    }, 2000)
  }

  static setOnCrashCallback(callback) {
    this.onCrashCallback = callback
  }

  static async getAvailableCrashDumpDirectories() {
    if (fs.existsSync(CRASH_DUMPS_PATH)) {
      return (await fs.promises.readdir(CRASH_DUMPS_PATH, { withFileTypes: true })).filter(
        item => item.isDirectory(),
      ).map(
        item => item.name,
      )
    } else {
      return []
    }
  }

  static async createSupportBundle(crashDumpDirectory = null) {
    console.log('CrashDetectService: Collecting crash dumps and logs...')

    const zip = new Zip()

    if (crashDumpDirectory) {
      await zip.addLocalFolderPromise(`${CRASH_DUMPS_PATH}/${crashDumpDirectory}`, {
        zipPath: 'dump',
      })
    }

    // Collect logs and Git revisions
    const logFiles = ['cs_log.txt', 'injector.csv', 'VERSION', 'settings.ini', 'run_id']
    for (const file of await fs.promises.readdir(RANDOMIZER_BASE_PATH)) {
      if (logFiles.includes(file) || file.endsWith('.revision')) {
        const fullPath = path.join(RANDOMIZER_BASE_PATH, file)

        if (fs.existsSync(fullPath)) {
          zip.addLocalFile(fullPath)
        }
      }
    }

    // Collect current seed
    const currentSeedPath = LauncherService.getCurrentSeedPath()
    if (currentSeedPath && fs.existsSync(currentSeedPath)) {
      await zip.addFile('seed.wotwr', await fs.promises.readFile(currentSeedPath))
    }

    const supportBundleName = `${Date.now()}.zip`
    const targetZipPath = this.getFullPathToSupportBundle(supportBundleName)
    await zip.writeZipPromise(targetZipPath)
    console.log(`CrashDetectService: Wrote support bundle to ${targetZipPath}`)

    return supportBundleName
  }

  static getFullPathToSupportBundle(supportBundleName) {
    return path.resolve(process.cwd(), `${CRASH_ZIP_PATH}/${supportBundleName}`)
  }
}
