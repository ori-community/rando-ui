import path from "path"
import {app} from "electron"

export function getUserDataPath(relativePath = "."): string {
  return path.join(app.getPath("userData"), relativePath)
}
