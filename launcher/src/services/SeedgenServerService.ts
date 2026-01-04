import {execa, ResultPromise} from "execa"
import {LauncherService} from "@launcher/services/LauncherService"
import {getInstallDataPath, getUserDataPath} from "@launcher/paths"
import log from "electron-log"


type SeedgenExecaOptions = {
  detached: true,
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

  /**
   * Returns whether a seedgen process that has been started by this process is running
   * @private
   */
  static #isSeedgenProcessRunning() {
    return this._process !== null && this._process.exitCode === null
  }

  /**
   * Ensure the seedgen HTTP server is running.
   * @param forceRestart If true, terminates an already running seedgen server. Only works if that server has been started by the launcher.
   * @param readyTimeoutMs Timeout in milliseconds to wait for the seedgen server to become ready.
   */
  static async ensureRunning(forceRestart = false, readyTimeoutMs = 10000) {
    if (this.#isSeedgenProcessRunning()) {
      if (!forceRestart) {
        return
      }

      this._process.kill()
      this._process = null
    }

    await Promise.race([
      new Promise<void>((_resolve, reject) => setTimeout(reject, readyTimeoutMs)),
      new Promise<void>((resolve, reject) => {
        const logInfo = function* (line: string) {
          log.info("Seedgen: " + line)
        }

        const logError = function* (line: string) {
          log.error("Seedgen: " + line)

          if (line.startsWith("Listening on")) {
            resolve()
          }
        }

        const seedgenExec = execa<SeedgenExecaOptions>({
          detached: true,
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

        const seedgenCliArguments = [
          "http-server",
          "--inactivity-timeout",
          "5m",
        ]

        switch (LauncherService.getPlatform()) {
          case "windows":
            this._process = seedgenExec(getInstallDataPath("seedgen/wotw-seedgen.exe"), seedgenCliArguments)
            break
          case "linux":
            this._process = seedgenExec(getInstallDataPath("seedgen/wotw-seedgen"), seedgenCliArguments)
            break
        }

        this._process
          .catch((err: Error) => {
            log.error("Seedgen server failed:", err)
            reject(err)
          })
      }),
    ])
  }
}
