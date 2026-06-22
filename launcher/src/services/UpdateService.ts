import {getInstallDataPath, getTemporaryUserDataPath} from "@launcher/paths"
import fs from "fs"
import axios, {AxiosResponseHeaders} from "axios"
import {EventEmitter} from "events"
import Stream from "node:stream"
import {app} from "electron"
import {spawn} from "child_process"
import log from "electron-log/main"
import {throttle} from "lodash"
import os from "node:os"
import {shell as electronShell} from "electron"
import {SeedgenServerService} from "@launcher/services/SeedgenServerService"


type InputBindingsEvent = {
  /** Emitted when the update download progress changes, null if no update is in progress */
  updateDownloadProgressChanged: [number | null],
}

type DownloadUrls = {
  windowsInstaller: string,
  linuxAppimage: string,
  linuxPortable: string,
}

export class UpdateService {
  public static readonly events: EventEmitter<InputBindingsEvent> = new EventEmitter()

  private static isUpdating = false
  private static downloadTotalBytes: number = 0
  private static downloadCompletedBytes: number = 0
  private static readonly throttledEmitUpdateDownloadProgress = throttle(() => {
    this.events.emit("updateDownloadProgressChanged", this.updateDownloadProgress)
  }, 10)

  static get updateDownloadProgress() {
    if (!this.isUpdating) {
      return null
    }

    return this.downloadTotalBytes === 0
      ? 0
      : this.downloadCompletedBytes / this.downloadTotalBytes
  }

  public static async getVersion() {
    const versionFilePath = getInstallDataPath("versions/randomizer_version")

    if (!fs.existsSync(versionFilePath)) {
      return "develop"
    }

    return (await fs.promises.readFile(versionFilePath, {encoding: "utf8"})).trim()
  }

  private static async downloadUpdate(url: string, targetFileName: string) {
    const {data, headers}: { data: Stream, headers: AxiosResponseHeaders } = await axios.get(url, {
      responseType: "stream",
    })

    this.downloadTotalBytes = Number(headers["content-length"] || 0)

    const writeStream = fs.createWriteStream(targetFileName)
    data.pipe(writeStream)

    await new Promise<void>((resolve, reject) => {
      this.downloadCompletedBytes = 0

      data.on("data", chunk => {
        this.downloadCompletedBytes += chunk.length
        this.throttledEmitUpdateDownloadProgress()
      })

      data.on("error", error => {
        reject(error)
      })

      writeStream.on("error", error => {
        reject(error)
      })

      writeStream.on("close", () => {
        resolve()
      })
    })
  }

  public static async downloadAndInstallUpdate(urls: DownloadUrls) {
    if (this.isUpdating) {
      return
    }

    this.isUpdating = true

    if (os.platform() === "win32") {  // Windows Installer
      const installerPath = getTemporaryUserDataPath("randomizer_update.exe")
      await this.downloadUpdate(urls.windowsInstaller, installerPath)

      app.on("quit", async () => {
        await SeedgenServerService.kill()

        log.info("UpdateService: Spawning process: ", installerPath)
        spawn(installerPath, ["/SILENT"], {
          detached: true,
          stdio: "ignore",
        }).unref()
      })
      app.quit()
    } else if (os.platform() === "linux") {
      if (process.env.APPIMAGE) {  // Linux AppImage
        const temporaryPath = getTemporaryUserDataPath("randomizer_update.AppImage")

        if (!fs.existsSync(process.env.APPIMAGE)) {
          log.error(`UpdateService: File at APPIMAGE (${process.env.APPIMAGE}) does not exist, aborting`)
          this.isUpdating = false
          this.throttledEmitUpdateDownloadProgress()
          return
        }

        await this.downloadUpdate(urls.linuxAppimage, temporaryPath)

        app.on("quit", async () => {
          await SeedgenServerService.kill()

          log.info("UpdateService: Replacing AppImage")
          await fs.promises.copyFile(temporaryPath, process.env.APPIMAGE)
          await fs.promises.chmod(process.env.APPIMAGE, 0o755)

          spawn(process.env.APPIMAGE, [], {
            detached: true,
            stdio: "ignore",
          }).unref()
        })

        app.quit()

      } else {  // Linux Portable
        const temporaryPath = getTemporaryUserDataPath("randomizer_update.tar.gz")
        await this.downloadUpdate(urls.linuxPortable, temporaryPath)

        app.on("quit", async () => {
          await SeedgenServerService.kill()
        })

        // TODO: Maybe extract automatically, not sure yet whether the portable version
        //       should be supported at all in the end...
        electronShell.showItemInFolder(temporaryPath)
        app.quit()
      }
    }
  }
}
