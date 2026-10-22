import {stripVTControlCharacters} from "node:util"
import {getInstallDataPath, getUserDataPath} from "@launcher/paths"
import {LauncherService} from "@launcher/services/LauncherService"
import log from "electron-log/main"
import {execa, ResultPromise, StdoutStderrOption} from "execa"

type SeedgenExecaOptions = {
  detached: true
  env: {
    RANDOMIZER_USER_DATA_DIR: string
  }
  stdout: StdoutStderrOption
  stderr: StdoutStderrOption
}

export class SeedgenServerService {
  private static _process: ResultPromise<SeedgenExecaOptions> | null = null
  private static _currentStartupPromise: Promise<void> | null = null

  /**
   * Returns whether a seedgen process that has been started by this process is running
   * @private
   */
  static #isSeedgenProcessRunning() {
    return this._process !== null && this._process.nodeChildProcess.exitCode === null
  }

  /**
   * Kills the seedgen process if it is running and was started by the launcher
   */
  static async kill() {
    if (!this.#isSeedgenProcessRunning()) {
      return
    }

    this._process?.kill("SIGTERM")
  }

  /**
   * Ensure the seedgen HTTP server is running.
   * @param forceRestart If true, terminates an already running seedgen server. Only works if that server has been started by the launcher.
   * @param readyTimeoutMs Timeout in milliseconds to wait for the seedgen server to become ready.
   */
  static async ensureRunning(forceRestart = false, readyTimeoutMs = 10000) {
    if (this.#isSeedgenProcessRunning()) {
      if (!forceRestart) {
        await this._currentStartupPromise
        return
      }

      this._process?.kill()
      this._process = null
    }

    this._currentStartupPromise = Promise.race([
      new Promise<void>((_resolve, reject) =>
        setTimeout(() => reject("Timeout while starting seedgen HTTP server"), readyTimeoutMs),
      ),
      new Promise<void>((resolve, reject) => {
        const logInfo = function* (line: unknown) {
          if (typeof line !== "string") {
            return
          }

          log.info("Seedgen: " + stripVTControlCharacters(line))
          yield ""
        }

        const logError = function* (line: unknown) {
          if (typeof line !== "string") {
            return
          }

          log.error("Seedgen: " + stripVTControlCharacters(line))

          if (line.startsWith("Listening on")) {
            resolve()
          }

          yield ""
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

        const seedgenCliArguments = ["http-server", "--inactivity-timeout", "5m"]

        switch (LauncherService.getPlatform()) {
          case "windows":
            this._process = seedgenExec(getInstallDataPath("seedgen/wotw-seedgen.exe"), seedgenCliArguments)
            break
          case "linux":
            this._process = seedgenExec(getInstallDataPath("seedgen/wotw-seedgen"), seedgenCliArguments)
            break
        }

        this._process.catch((err: Error) => {
          // Seedgen HTTP server was started outside the launcher
          if (this._process?.nodeChildProcess.exitCode === 2) {
            resolve()
            return
          }

          log.error("Seedgen server failed:", err)
          reject(err)
        })
      }),
    ])

    await this._currentStartupPromise
  }
}
