import {publicProcedure, router} from "../trpc"
import fs from "fs"
import {getInstallDataPath} from "../../paths"

export const updater = router({
  /**
   * Returns the version string, or "develop" if no version is specified.
   */
  getVersion: publicProcedure
    .query(async () => {
      const versionFilePath = getInstallDataPath("VERSION")

      if (!fs.existsSync(versionFilePath)) {
        return "develop"
      }

      return await fs.promises.readFile(versionFilePath, {encoding: "utf8"})
    })
})
