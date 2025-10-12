import {LaunchSetupValidationError} from "@shared/types/launcher"
import {SettingsService} from "@launcher/services/SettingsService"
import fs from "node:fs"
import {execa} from "execa"
import path from "node:path"
import {getInstallDataPath} from "@launcher/paths"
import {hashFile} from "hasha"
import {Settings} from "@shared/types/settings"
import os from "node:os"
import {LauncherPlatform} from "@shared/types/platform"

export class LauncherService {
  static getPlatform(): LauncherPlatform {
    switch (os.platform()) {
      case "linux":
        return "linux"
      case "win32":
        return "windows"
    }

    throw new Error("The launcher is only supported on Windows and Linux systems")
  }

  static async getGameLaunchMethodsAvailableOnPlatform(): Promise<Settings["GameLaunchMethod"][]> {
    switch (this.getPlatform()) {
      case "windows":
        return ["standalone", "steam", "microsoft-store"]
      case "linux":
        return ["standalone"]
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
        if (settings.ModloaderMethod === "proxy") {
          errors.push("proxy-and-microsoft-store-incompatible")
        }
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

    return errors
  }

  /**
   * Symlinks the winhttp.dll modloader proxy next to the game binary.
   * Use `isProxyModloaderUpToDate` to check whether it exists and is up to date.
   */
  static async installOrUpdateProxyModloader() {
    const settings = await SettingsService.instance.getSettings()
    const sourceProxyFileName = getInstallDataPath("winhttp.dll")
    const targetProxyFileName = path.join(path.dirname(settings.GameBinaryPath), "winhttp.dll")

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
  }

  /**
   * Returns whether the winhttp.dll proxy modloader is properly installed.
   * It internally checks whether the checksum of the proxy modloader next to the game binary
   * and the one shipped with the launcher are equal.
   */
  static async isProxyModloaderUpToDate() {
    const settings = await SettingsService.instance.getSettings()
    const sourceProxyFileName = getInstallDataPath("winhttp.dll")
    const targetProxyFileName = path.join(path.dirname(settings.GameBinaryPath), "winhttp.dll")

    if (!fs.existsSync(targetProxyFileName)) {
      return false
    }

    const sourceHash = await hashFile(sourceProxyFileName, {algorithm: "md5"})
    const targetHash = await hashFile(targetProxyFileName, {algorithm: "md5"})

    return sourceHash === targetHash
  }
}
