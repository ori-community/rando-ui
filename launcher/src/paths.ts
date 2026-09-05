import path from "path"
import {app} from "electron"
import os from "os"

function getBaseUserDataPath() {
  if (os.platform() === "linux") {
    const userDataHome = process.env.XDG_DATA_HOME ?? `${process.env.HOME}/.local/share`
    return path.join(userDataHome, "ori-wotw-randomizer")
  }

  return app.getPath("userData")
}

export function getUserDataPath(relativePath = "."): string {
  if (process.env.NODE_ENV === "development") {
    return path.join(process.cwd(), "development-user-data", relativePath)
  }

  return path.join(getBaseUserDataPath(), relativePath)
}

export function getInstallDataPath(relativePath = "."): string {
  if (process.env.NODE_ENV === "development") {
    return path.join(process.cwd(), "development-install-data", relativePath)
  }

  return path.join(path.dirname(app.getPath("exe")), relativePath)
}

// Wrappers for well-known directories:
export function getRandomizerUserDataPath(relativePath = ".") {
  return getUserDataPath(path.join("randomizer", relativePath))
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
