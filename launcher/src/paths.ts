import path from "path"
import {app} from "electron"

export function getUserDataPath(relativePath = "."): string {
  if (process.env.NODE_ENV === "development") {
    return path.join(process.cwd(), "development-user-data", relativePath)
  }

  return path.join(app.getPath("userData"), relativePath)
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
