import path from "path"
import {app} from "electron"

export function getUserDataPath(relativePath = "."): string {
  return path.join(app.getPath("userData"), "randomizer", relativePath)
}

export function getInstallDataPath(relativePath = "."): string {
  return path.join(path.dirname(app.getPath("exe")), relativePath)
}
