import os from "node:os"
import log from "electron-log/main"
import path from "node:path"
import {SettingsService} from "@launcher/services/SettingsService"
import {SettingKey} from "@shared/types/settings"
import {getInstallDataPath, getUserDataPath} from "@launcher/paths"
import nodeFs from "node:fs"
import {create as createArchive} from "archiver"


export class SupportBundleService {
  public static readonly instance = new SupportBundleService()

  private appdataPath: string | null = null
  private knownCrashDumpDirectories: Set<string> = new Set()

  constructor() {
    SettingsService.instance.events.on("settingChanged", async (key: SettingKey) => {
      switch (key) {
        case "GameLaunchMethod":
        case "GameBinaryPath":
          await this.refreshPaths()
          break
        default:
          break
      }
    })
  }

  private async refreshPaths() {
    let newPath: string | null = null

    switch (os.platform()) {
      case "win32":
        newPath = path.normalize(path.join(process.env.APPDATA, ".."))
        break
      case "linux":
        const settings = await SettingsService.instance.getSettings()

        switch (settings.GameLaunchMethod) {
          case "steam":
            newPath = path.normalize(
              path.join(
                (await SettingsService.instance.getSettings()).GameBinaryPath,
                "..",
                "..",
                "..",
                "compatdata",
                "1057090",
                "pfx",
                "drive_c",
                "users",
                "steamuser",
                "AppData",
              )
            )
            break;
          case "standalone":
            newPath = path.normalize(
              path.join(
                getUserDataPath("wineprefix"),
                "drive_c",
                "users",
                process.env.USER ?? "user",
                "AppData",
              )
            )
            break;
          default:
        }
        break
      default:
        log.error("SupportBundleService: Unsupported platform")
        this.knownCrashDumpDirectories.clear()
        return
    }

    if (this.appdataPath === newPath) {
      return
    }

    this.appdataPath = newPath
    log.info(`SupportBundleService: Appdata path = ${this.appdataPath}`)
    this.knownCrashDumpDirectories = await this.getAvailableCrashDumpPaths()
  }

  private async getAvailableCrashDumpPaths(): Promise<Set<string>> {
    if (this.appdataPath === null) {
      return new Set()
    }

    const crashDumpsPath = path.join(
      this.appdataPath,
      "Local",
      "Temp",
      "Moon Studios",
      "OriAndTheWilloftheWisps",
      "Crashes",
    )

    if (!nodeFs.existsSync(crashDumpsPath)) {
      return new Set()
    }

    return new Set(
      (await nodeFs.promises.readdir(crashDumpsPath, {withFileTypes: true}))
        .filter(
          item => item.isDirectory(),
        ).map(
          item => path.join(crashDumpsPath, item.name),
        )
        .toSorted()
    )
  }

  private async collectNewCrashDumps() {
    if (this.appdataPath === null) {
      return
    }

    const discoveredCrashDumpPaths = await this.getAvailableCrashDumpPaths()
    const newCrashDumps = discoveredCrashDumpPaths.difference(this.knownCrashDumpDirectories)

    if (newCrashDumps.size > 0) {
      const crashDumpPath = Array.from(newCrashDumps)[0]
      log.info(`SupportBundleService: Detected crash (${crashDumpPath}), will create support bundle shortly...`)

      // Wait three seconds because the Unity crash handler needs a bit to write everything
      await new Promise(resolve => setTimeout(resolve, 3000))
      await this.createSupportBundle(crashDumpPath)
    }

    this.knownCrashDumpDirectories = discoveredCrashDumpPaths
  }

  async start() {
    await this.refreshPaths()

    const collectNewCrashDumpsLoop = () => {
      setTimeout(async () => {
        try {
          await this.collectNewCrashDumps()
        } catch (e) {
          log.error("SupportBundleService: Error while collecting new crash dumps: ", e)
        }
        collectNewCrashDumpsLoop()
      }, 2000)
    }

    collectNewCrashDumpsLoop()
  }

  // Creates a support bundle
  async createSupportBundle(crashDumpPath: string | null = null): Promise<string> {
    log.info("SupportBundleService: Collecting data...")

    type Entry = {
      source: string,
      target: string,
    }

    const directoryEntries: Entry[] = [
      {source: getInstallDataPath("versions"), target: "versions"},
      {source: getUserDataPath("logs"), target: "logs"},
    ]
    const fileEntries: Entry[] = [
      {source: getUserDataPath("randomizer/.newgameseedsource"), target: "randomizer"},
      {source: getUserDataPath("randomizer/controller_bindings.json"), target: "randomizer"},
      {source: getUserDataPath("randomizer/keyboard_bindings.json"), target: "randomizer"},
      {source: getUserDataPath("randomizer/midi_bindings.json"), target: "randomizer"},
      {source: getUserDataPath("randomizer/settings.json"), target: "randomizer"},
    ]

    // Collect crash dump
    if (crashDumpPath !== null) {
      directoryEntries.push({
        source: crashDumpPath,
        target: "dump",
      })
    }

    // Collect save files
    if (this.appdataPath !== null) {
      const saveFilesPath = path.join(
        this.appdataPath,
        "Local",
        "Ori and the Will of The Wisps",
      )

      if (nodeFs.existsSync(saveFilesPath)) {
        for (const saveFilePath of await nodeFs.promises.readdir(saveFilesPath)) {
          if (saveFilePath.endsWith(".uberstate")) {
            fileEntries.push({
              source: path.join(saveFilesPath, saveFilePath),
              target: "saves",
            })
          }
        }
      }
    }

    // Create ZIP archive
    await nodeFs.promises.mkdir(getUserDataPath("support_bundles"), {recursive: true})
    const supportBundleFileName = getUserDataPath(`support_bundles/${Date.now()}.zip`)
    const outputStream = nodeFs.createWriteStream(supportBundleFileName, {emitClose: true})
    const outputStreamFinishedPromise = new Promise(resolve => outputStream.on('close', resolve))

    const archive = createArchive("zip", {
      zlib: {
        level: 9,
      },
    })
    archive.pipe(outputStream)

    for (const directoryEntry of directoryEntries) {
      if (!nodeFs.existsSync(directoryEntry.source) || !(await nodeFs.promises.lstat(directoryEntry.source)).isDirectory()) {
        continue
      }

      archive.directory(
        directoryEntry.source,
        directoryEntry.target,
      )
    }

    for (const fileEntry of fileEntries) {
      if (!nodeFs.existsSync(fileEntry.source) || !(await nodeFs.promises.lstat(fileEntry.source)).isFile()) {
        continue
      }

      archive.file(
        fileEntry.source,
        {
          name: `${fileEntry.target}/${path.basename(fileEntry.source)}`,
        }
      )
    }

    await archive.finalize()
    await outputStreamFinishedPromise

    log.info(`SupportBundleService: Created support bundle at ${supportBundleFileName}`)

    return supportBundleFileName
  }
}
