import os from "os"
import path from "path"

import {app} from "electron"

function getBaseUserDataPath() {
  if (os.platform() === "linux") {
    const userDataHome = process.env.XDG_DATA_HOME ?? `${process.env.HOME}/.local/share`
    return path.join(userDataHome, "ori-wotw-randomizer")
  }

  if (!process.env.APPDATA) {
    throw new Error("APPDATA environment variable is not set")
  }

  return path.join(process.env.APPDATA, "ori-wotw-randomizer")
}

export function getUserDataPath(relativePath = "."): string {
  if (import.meta.env.DEV) {
    return path.join(process.cwd(), "development-user-data", relativePath)
  }

  return path.join(getBaseUserDataPath(), relativePath)
}

export function getInstallDataPath(relativePath = "."): string {
  if (import.meta.env.DEV) {
    return path.join(process.cwd(), "development-install-data", relativePath)
  }

  return path.join(path.dirname(app.getPath("exe")), relativePath)
}

// Wrappers for well-known directories:
export function getClientUserDataPath(relativePath = ".") {
  return getUserDataPath(path.join("client", relativePath))
}

export function getLogsUserDataPath(relativePath = ".") {
  return getUserDataPath(path.join("logs", relativePath))
}

export function getSeedgenUserDataPath(relativePath = ".") {
  return getUserDataPath(path.join("seedgen", relativePath))
}

export function getSeedsUserDataPath(relativePath = ".") {
  return getSeedgenUserDataPath(path.join("seeds", relativePath))
}

export function getTemporaryUserDataPath(relativePath = ".") {
  return getUserDataPath(path.join("temp", relativePath))
}

export function getPlandosUserDataPath(relativePath = ".") {
  return getSeedgenUserDataPath(path.join("plandos", relativePath))
}
