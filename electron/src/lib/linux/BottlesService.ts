import path from 'path'
import fs from 'fs'
import { lookpath } from 'lookpath'
import { execa } from 'execa'
import { RANDOMIZER_BASE_PATH } from '@/lib/Constants'
import { SettingsService } from '@/lib/SettingsService'
import { uiIpc } from '@/api'

export class BottlesService {
  static async getGameBinaryPath(): Promise<string> {
    return (await SettingsService.getCurrentSettings())['Paths.GameBinary']
  }

  static async checkEnvironment() {
    if (!(await lookpath('flatpak'))) {
      throw new Error('Flatpak not found, please install Flatpak and Bottles and try again')
    }

    const { stdout: flatpakListOutput } = await execa('flatpak', ['list', '--app', '--columns=application'])

    if (!flatpakListOutput.split('\n').map(s => s.trim()).includes('com.usebottles.bottles')) {
      throw new Error('Bottles is not installed, please install Bottles with Flatpak')
    }

    if (!fs.existsSync(await this.getGameBinaryPath())) {
      throw new Error('Game binary not found, please select oriwotw.exe in settings')
    }
  }

  /**
   * Checks whether the prefix exists and sets one
   * up if it doesn't.
   */
  static async getPreparedBottleName() {
    const { stdout: bottlesListOutput } = await execa('flatpak', ['run', '--command=bottles-cli', 'com.usebottles.bottles', '-j', 'list', 'bottles'])
    const bottles = JSON.parse(bottlesListOutput)

    const existingRandoBottleName = Object.keys(bottles).find(bottleName => {
      return bottles[bottleName].Environment_Variables['RANDO_LAUNCHER_CREATED'] === 'TRUE'
    }) ?? null

    if (existingRandoBottleName) {
      return existingRandoBottleName
    }

    uiIpc.queueSend('main.notification', 'Configuring Bottles... This might take a while!')

    const newBottleName = 'Ori and the Will of the Wisps Randomizer'

    await execa('flatpak', ['override', '--user', 'com.usebottles.bottles', `--filesystem=${fs.realpathSync('.')}`])
    await execa('flatpak', ['run', '--command=bottles-cli', 'com.usebottles.bottles', '-j', 'new', '--bottle-name', newBottleName, '--environment', 'gaming'])
    await execa('flatpak', ['run', '--command=bottles-cli', 'com.usebottles.bottles', '-j', 'edit', '-b', newBottleName, '--env-var', 'RANDO_LAUNCHER_CREATED=TRUE'])
    await execa('flatpak', ['run', '--command=bottles-cli', 'com.usebottles.bottles', '-j', 'edit', '-b', newBottleName, '--env-var', 'WINEDLLOVERRIDES=winhttp.dll=n,b'])

    fs.copyFileSync(
      path.join(RANDOMIZER_BASE_PATH, 'winhttp.dll'),
      path.join(path.dirname(await this.getGameBinaryPath()), 'winhttp.dll'),
    )

    return newBottleName
  }

  static async launchGameAndDetach(bottleName: string) {
    execa('flatpak', ['run', '--command=bottles-cli', 'com.usebottles.bottles', '-j', 'run', '-b', bottleName, '-e', fs.realpathSync(await this.getGameBinaryPath()), '--', '-m', fs.realpathSync(RANDOMIZER_BASE_PATH)], {
      detached: true,
      stdio: 'ignore',
    }).unref()
  }
}
