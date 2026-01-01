import {LaunchResult, LaunchSetupValidationError} from "@shared/types/launcher"
import {SettingsService} from "@launcher/services/SettingsService"
import fs from "node:fs"
import {execa} from "execa"
import path from "node:path"
import {getInstallDataPath, getRandomizerUserDataPath, getUserDataPath} from "@launcher/paths"
import {fromFile as hashFile} from "hasha"
import {Settings} from "@shared/types/settings"
import os from "node:os"
import {LauncherPlatform} from "@shared/types/platform"
import log from "electron-log/main"
import {waitForProcess} from "@launcher/helpers"
import {RandoIPCService} from "@launcher/services/RandoIPCService"
import {LocalTrackerService} from "@launcher/services/LocalTrackerService"
import {EventEmitter} from "events"

type LauncherEvent = {
  /** Emitted when the isLaunching property changed */
  isLaunchingChanged: [boolean],

  /** Emitted when a LaunchResult is ready */
  onLaunchResult: [LaunchResult],
}

export class LauncherService {
  public static readonly events: EventEmitter<LauncherEvent> = new EventEmitter()

  /** Internal state. Use isLaunching instead. */
  private static _isLaunching: boolean = false

  public static get isLaunching(): boolean {
    return this._isLaunching
  }

  private static set isLaunching(value: boolean) {
    this._isLaunching = value
    LauncherService.events.emit("isLaunchingChanged", value)
  }

  static getPlatform(): LauncherPlatform {
    switch (os.platform()) {
      case "linux":
        return "linux"
      case "win32":
        return "windows"
    }

    throw new Error("The launcher is only supported on Windows and Linux systems")
  }

  /**
   * Returns the available game launch methods on the current platform
   */
  static async getGameLaunchMethodsAvailableOnPlatform(): Promise<Settings["GameLaunchMethod"][]> {
    switch (this.getPlatform()) {
      case "windows":
        return ["standalone", "steam", "microsoft-store"]
      case "linux":
        return ["standalone"]
    }
  }

  /**
   * Returns the available Modloader methods on the current platform
   */
  static async getModloaderMethodsAvailableOnPlatform(): Promise<Settings["ModloaderMethod"][]> {
    switch (this.getPlatform()) {
      case "windows":
        return ["inject", "proxy"]
      case "linux":
        return ["proxy"]
    }
  }

  /**
   * Returns the available Modloader methods on the current platform
   */
  static async getModloaderMethodsAvailableOnForGameLaunchMethod(gameLaunchMethod: Settings["GameLaunchMethod"]): Promise<Settings["ModloaderMethod"][]> {
    switch (gameLaunchMethod) {
      case "steam":
        return ["proxy", "inject"]
      case "microsoft-store":
        return ["inject"]
      case "standalone":
        return ["proxy", "inject"]
    }
  }

  /**
   * Returns an array of launch validation errors.
   * If the returned array is empty the randomizer can be
   * considered ready to launch.
   */
  static async validateSetup() {
    const errors: LaunchSetupValidationError[] = []
    const settings = await SettingsService.instance.getSettings()

    let gameBinaryNeedsToBeValid = false
    let steamBinaryNeedsToBeValid = false

    switch (settings.GameLaunchMethod) {
      case "steam":
        steamBinaryNeedsToBeValid = true

        if (settings.ModloaderMethod === "proxy") {
          gameBinaryNeedsToBeValid = true
        }
        break
      case "microsoft-store":
        break
      case "standalone":
        gameBinaryNeedsToBeValid = true
        break
    }

    if (gameBinaryNeedsToBeValid && !fs.existsSync(settings.GameBinaryPath)) {
      errors.push("invalid-game-binary-path")
    }

    if (steamBinaryNeedsToBeValid && !fs.existsSync(settings.SteamBinaryPath)) {
      errors.push("invalid-steam-binary-path")
    }

    if (
      settings.ModloaderMethod === "proxy" &&
      settings.ValidateProxyModloader &&
      !await LauncherService.isProxyModloaderUpToDate()
    ) {
      errors.push("invalid-proxy-modloader-file")
    }

    const gameLaunchMethodsAvailable = await this.getGameLaunchMethodsAvailableOnPlatform()
    const modloaderMethodsAvailableOnPlatform = await this.getModloaderMethodsAvailableOnPlatform()
    const modloaderMethodsAvailableForGameLaunchMethod = await this.getModloaderMethodsAvailableOnForGameLaunchMethod(settings.GameLaunchMethod)

    if (!gameLaunchMethodsAvailable.includes(settings.GameLaunchMethod)) {
      errors.push("game-launch-method-not-available-on-current-platform")
    }

    if (!modloaderMethodsAvailableOnPlatform.includes(settings.ModloaderMethod)) {
      errors.push("modloader-method-not-available-on-current-platform")
    }

    if (!modloaderMethodsAvailableForGameLaunchMethod.includes(settings.ModloaderMethod)) {
      errors.push("modloader-method-not-available-for-game-launch-method")
    }

    return errors
  }

  /**
   * Symlinks the winhttp.dll modloader proxy next to the game binary.
   * Use `isProxyModloaderUpToDate` to check whether it exists and is up to date.
   */
  static async installOrUpdateProxyModloader() {
    if (await LauncherService.isProxyModloaderUpToDate()) {
      return
    }

    const settings = await SettingsService.instance.getSettings()
    const sourceProxyFileName = await fs.promises.realpath(getInstallDataPath("client/winhttp.dll"))
    const targetProxyFileName = path.join(await fs.promises.realpath(path.join(path.dirname(settings.GameBinaryPath))), "winhttp.dll")

    switch (this.getPlatform()) {
      case "windows":
        await execa("Start-Process", [
          "powershell",
          "-ArgumentList",
          `"New-Item -Path '${targetProxyFileName}' -ItemType SymbolicLink -Value '${sourceProxyFileName}' -Force; sleep 2;"`,
          "-Verb",
          "RunAs",
          "-Wait",
          "-WindowStyle",
          "Hidden",
        ], {
          shell: "powershell",
          windowsHide: true,
        })
        break
      case "linux":
        await fs.promises.rm(targetProxyFileName, {force: true})

        if (process.env.WOTW_RANDOMIZER_APPIMAGE_ROOT) {
          // Always copy when running in AppImage because the mountpoint will likely
          // be different every time
          await fs.promises.copyFile(sourceProxyFileName, targetProxyFileName)
        } else {
          await fs.promises.symlink(sourceProxyFileName, targetProxyFileName)
        }

        break
    }
  }

  /**
   * Returns whether the winhttp.dll proxy modloader is properly installed.
   * It internally checks whether the checksum of the proxy modloader next to the game binary
   * and the one shipped with the launcher are equal.
   */
  static async isProxyModloaderUpToDate() {
    const settings = await SettingsService.instance.getSettings()
    const sourceProxyFileName = await fs.promises.realpath(getInstallDataPath("client/winhttp.dll"))
    const targetProxyFileName = path.join(await fs.promises.realpath(path.join(path.dirname(settings.GameBinaryPath))), "winhttp.dll")

    if (!fs.existsSync(targetProxyFileName)) {
      return false
    }

    const sourceHash = await hashFile(sourceProxyFileName, {algorithm: "md5"})
    const targetHash = await hashFile(targetProxyFileName, {algorithm: "md5"})

    return sourceHash === targetHash
  }

  /**
   * Sets the seed source for new games. (aka writes to .newgameseedsource)
   */
  static async setNewGameSeedSource(seedSource: string) {
    await fs.promises.writeFile(getRandomizerUserDataPath(".newgameseedsource"), seedSource, {encoding: "utf-8"})
  }

  /**
   * Launches the randomizer or brings the game window into focus if it's
   * already running.
   */
  static async launchOrFocusRandomizer(seedSource: string | undefined = undefined): Promise<LaunchResult> {
    // This is just a wrapper around _launchOrFocusRandomizer that also updates
    // isLaunching and makes sure it gets reset properly.

    try {
      this.isLaunching = true
      const response = await this._launchOrFocusRandomizer(seedSource)
      this.events.emit("onLaunchResult", response)
      this.isLaunching = false
      return response
    } catch (e) {
      this.events.emit("onLaunchResult", {
        launchedSuccessfully: false,
        errorType: "unknown_error",
        errorMessage: "An unknown error occurred: " + String(e),
      })
      this.isLaunching = false
      throw e
    }
  }

  private static async _launchOrFocusRandomizer(seedSource: string | undefined): Promise<LaunchResult> {
    if (seedSource !== undefined) {
      await this.setNewGameSeedSource(seedSource)
    }

    if (RandoIPCService.isConnected()) {
      await RandoIPCService.emit("load_new_game_source")

      if (this.getPlatform() === "windows") {
        (await import("focus-ori")).focusOri()
      }

      return {launchedSuccessfully: true}
    }

    const setupValidationErrors = await this.validateSetup()

    if (setupValidationErrors.length > 0) {
      return {
        launchedSuccessfully: false,
        errorType: "setup_validation_errors",
        setupValidationErrors,
      }
    }

    await SettingsService.instance.flushSettings()
    const settings = await SettingsService.instance.getSettings()

    const defaultExec = execa({
      stdio: "inherit",
    })
    const defaultExecDetached = defaultExec({
      detached: true,
    })
    const powershellExec = defaultExec({
      shell: "powershell.exe",
    })

    if (settings.ModloaderMethod === "inject") {
      const injectorPathWithWindowsSlashes = getInstallDataPath("client/Injector.exe").replaceAll("/", "\\")

      const startArguments = ["-FilePath", injectorPathWithWindowsSlashes, "-ArgumentList", `"-i",\`"${getInstallDataPath()}\`","-u",\`"${getUserDataPath()}\`"`]
      if (!settings.DeveloperMode) {
        startArguments.push("-WindowStyle", "Hidden")
      }

      log.info("Starting Injector with start arguments:", startArguments)
      powershellExec("start", startArguments)

      await waitForProcess("injector.exe", 10)
    }

    const gameArguments: string[] = []

    if (settings.ModloaderMethod === "proxy") {
      gameArguments.push("-i", getInstallDataPath())
      gameArguments.push("-u", getUserDataPath())
    }

    switch (settings.GameLaunchMethod) {
      case "steam":
        defaultExecDetached(settings.SteamBinaryPath, ["-applaunch", "1057090", ...gameArguments])
        await waitForProcess("oriwotw.exe", 60)
        break
      case "microsoft-store":
        powershellExec("explorer.exe", ["shell:AppsFolder\\Microsoft.Patagonia_8wekyb3d8bbwe!App"]).unref()
        await waitForProcess("oriandthewillofthewisps-pc.exe")
        break
      case "standalone":
        switch (this.getPlatform()) {
          case "windows":
            defaultExecDetached(settings.GameBinaryPath, gameArguments)
            await waitForProcess("oriwotw.exe", 60)
            break
          case "linux":
            const wineprefixLocation = getUserDataPath("wineprefix")

            if (process.env.WOTW_RANDOMIZER_APPIMAGE_ROOT) {
              // We are running as AppImage and have access to our own wine and DXVK.
              log.info("Detected running inside AppImage")

              if (!fs.existsSync(wineprefixLocation)) {
                log.info("Creating Wineprefix with bundled Wine and DXVK")

                // Create a new wineprefix
                await defaultExec("wine", ["hostname"], {
                  env: {
                    WINEPREFIX: wineprefixLocation,
                  },
                })

                // Install DXVK
                await fs.promises.cp(
                  path.join(process.env.WOTW_RANDOMIZER_APPIMAGE_ROOT, "/opt/dxvk/x64"),
                  path.join(wineprefixLocation, "drive_c/windows/system32"), {
                    force: true,
                    recursive: true,
                  },
                )
              }
            }

            defaultExecDetached("wine", [settings.GameBinaryPath, ...gameArguments], {
              env: {
                WINEPREFIX: wineprefixLocation,
                WINEDLLOVERRIDES: "winhttp.dll=n,b",
              },
            })
            break
        }

        break
    }

    if (settings.LaunchWithTracker) {
      await LocalTrackerService.openLocalTracker()
    }

    return {launchedSuccessfully: true}
  }
}
