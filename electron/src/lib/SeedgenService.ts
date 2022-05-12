import {RANDOMIZER_BASE_PATH} from '@/lib/Constants'
import path from 'path'
import fs from 'fs/promises'
import chokidar, {FSWatcher} from 'chokidar'
import {uiIpc} from '@/api'

export class SeedgenService {
  private static sourceFileWatcher: FSWatcher | null = null

  public static getAreasFilePath() {
    return path.resolve(RANDOMIZER_BASE_PATH, './areas.wotw')
  }

  public static getLocDataFilePath() {
    return path.resolve(RANDOMIZER_BASE_PATH, './loc_data.csv')
  }

  public static async getAreasFileContents() {
    return (await fs.readFile(this.getAreasFilePath())).toString()
  }

  public static async getLocDataFileContents() {
    return (await fs.readFile(this.getLocDataFilePath())).toString()
  }

  public static startWatchingSourceFiles() {
    this.stopWatchingSourceFiles()
    this.sourceFileWatcher = chokidar.watch([this.getAreasFilePath(), this.getLocDataFilePath()], {
      ignoreInitial: true,
    })

    const listener = () => {
      uiIpc.queueSend('seedgen.sourceFilesUpdated')
    }
    this.sourceFileWatcher.on('change', listener)
    this.sourceFileWatcher.on('add', listener)
  }

  public static stopWatchingSourceFiles() {
    this.sourceFileWatcher?.close()
  }
}
