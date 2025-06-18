import {getInstallDataPath} from "../paths"
import fs from "fs"

export class VersionService {
  public static async getVersion() {
    const versionFilePath = getInstallDataPath("VERSION")

    if (!fs.existsSync(versionFilePath)) {
      return "develop"
    }

    return await fs.promises.readFile(versionFilePath, {encoding: "utf8"})
  }
}
