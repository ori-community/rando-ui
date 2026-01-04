import {execa, ResultPromise} from "execa"
import {LauncherService} from "@launcher/services/LauncherService"
import {getInstallDataPath, getUserDataPath} from "@launcher/paths"
import log from "electron-log"


type SeedgenExecaOptions = {
  env: {
    RANDOMIZER_USER_DATA_DIR: string,
  },
  stdout: {
    transform: (line: string) => Generator
  },
  stderr: {
    transform: (line: string) => Generator
  },
}

export class SeedgenServerService {
  private static _process: ResultPromise<SeedgenExecaOptions> | null = null

  static isRunning() {
    return this._process !== null && this._process.exitCode === null
  }

  static start(restartIfRunning = false) {
    if (this.isRunning()) {
      if (!restartIfRunning) {
        return
      }

      this._process.kill()
      this._process = null
    }

    const logInfo = function* (line: string) {
      log.info("Seedgen: " + line)
    }
    const logError = function* (line: string) {
      log.error("Seedgen: " + line)
    }

    const seedgenExec = execa<SeedgenExecaOptions>({
      env: {
        RANDOMIZER_USER_DATA_DIR: getUserDataPath(),
      },
      stdout: {
        transform: logInfo,
      },
      stderr: {
        transform: logError,
      },
    })

    log.info("Starting seedgen server")

    switch (LauncherService.getPlatform()) {
      case "windows":
        this._process = seedgenExec(getInstallDataPath("seedgen/wotw-seedgen.exe"), ["http-server"])
        break
      case "linux":
        this._process = seedgenExec(getInstallDataPath("seedgen/wotw-seedgen"), ["http-server"])
        break
    }

    this._process
      .catch((err: Error) => {
        log.error("Seedgen server failed:", err)
      })
      .finally(() => {
        setTimeout(
          () => {
            if (!this.isRunning()) {
              SeedgenServerService.start(true)
            }
          },
          // Exit Code 0 means it exited because an external http server was already running.
          // In that case we don't need to try to restart very soon.
          this._process.exitCode === 0
            ? 30000
            : 2000,
        )
      })
  }
}
