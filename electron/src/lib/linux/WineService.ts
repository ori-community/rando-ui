import path from 'path'
import fs from 'fs'
import { xdgData } from 'xdg-basedir'
import { lookpath } from 'lookpath'
import { execa } from 'execa'
import { mkdirp, remove, rmdir } from 'fs-extra'
import { RANDOMIZER_BASE_PATH, WINESTREAMPROXY_DIR } from '@/lib/Constants'
import { spawn } from 'child_process'

const log = (message: string) => console.log(`WineService: ${message}`)

export class WineService {
  static get prefixPath() {
    if (!xdgData) {
      throw new Error('Could not determine data directory')
    }

    return path.join(xdgData, 'wotw-rando-runtime')
  }

  static get gameBinaryPath() {
    // TODO
    return '/home/timo/.steam/steam/steamapps/common/Ori and the Will of the Wisps/oriwotw.exe'
  }

  static getPathInPrefix(p: string) {
    return path.join(this.prefixPath, p)
  }

  static async checkEnvironment() {
    if (!(await lookpath('wine'))) {
      throw new Error('Wine not found. Install Wine 7 or higher.')
    }

    if (!(await lookpath('winetricks'))) {
      throw new Error('Winetricks not found. Install Winetricks 20220411 or higher.')
    }

    const { stdout: wineOutput } = await execa('wine', ['--version'])
    const wineVersion = wineOutput.match(/wine-(?<version>\d+).*/)?.groups?.['version']

    if (!wineVersion || Number(wineVersion) < 7) {
      throw new Error('Unsupported Wine version. Use Wine 7 or higher.')
    }

    const { stdout: winetricksOutput } = await execa('winetricks', ['--version'])
    const winetricksVersion = winetricksOutput.match(/^(?<version>\d+).*/)?.groups?.['version']

    if (!winetricksVersion || Number(winetricksVersion) < 20220411) {
      throw new Error('Unsupported Winetricks version. Use Winetricks 20220411 or higher.')
    }
  }

  /**
   * Checks whether the prefix exists and sets one
   * up if it doesn't.
   */
  static async checkAndPreparePrefix() {
    if (fs.existsSync(this.getPathInPrefix('system.reg'))) {
      // Prefix exists, move on...
      return
    }

    log('Creating Wine prefix')
    await remove(this.prefixPath)
    await mkdirp(this.prefixPath)

    log('Setting up prefix...')
    await execa('winetricks', ['-q', 'dotnet48', 'vcrun2019', 'dxvk'], {
      stdio: 'inherit',
      env: {
        WINEPREFIX: this.prefixPath,
      },
    })

    log('Installing winestreamproxy service...')
    await execa(path.join(WINESTREAMPROXY_DIR, 'install.sh'), {
      cwd: WINESTREAMPROXY_DIR,
      stdio: 'inherit',
      env: {
        WINEPREFIX: this.prefixPath,
      }
    })
  }

  static async launchInjector() {
    await execa('wine', [path.join(RANDOMIZER_BASE_PATH, 'Injector.exe')], {
      env: {
        WINEPREFIX: this.prefixPath,
      },
      stdio: 'inherit',
    })
  }

  static launchGameAndDetach() {
    execa('wine', [this.gameBinaryPath], {
      detached: true,
      stdio: 'inherit',
      env: {
        WINEPREFIX: this.prefixPath,
      }
    }).unref()
  }
}
