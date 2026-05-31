import {publicProcedure, router} from "@launcher/api/trpc"
import {z} from "zod"
import {getSeedgenUserDataPath, getSeedsUserDataPath} from "@launcher/paths"
import nodeFs from "node:fs"
import path from "node:path"
import {UniversePreset} from "@shared/types/seedgen"

export const fs = router({
  /**
   * Save given seed binaries to the default seeds directory and returns
   * an array of paths saved. The returned array has the same length as the amount of
   * given seed binaries.
   */
  saveSeed: publicProcedure
    .input(
      z.object({
        worlds: z.array(z.instanceof(Uint8Array<ArrayBuffer>)),
      })
    )
    .query(async ({input}): Promise<string[]> => {
      const seedsDir = getSeedsUserDataPath()
      await nodeFs.promises.mkdir(seedsDir, {recursive: true})

      const id = Date.now()

      const filePaths = []
      for (let worldIndex = 0; worldIndex < input.worlds.length; worldIndex++) {
        const generateSeedFilePath = (offset: number = 0) => {
          let fileName = input.worlds.length === 1
            ? `${id}`
            : `${id}-${worldIndex}`

          if (offset > 0) {
            fileName += `-${offset}`
          }

          fileName += ".wotwr"
          fileName = path.join(seedsDir, fileName)

          if (nodeFs.existsSync(fileName)) {
            return generateSeedFilePath(offset + 1)
          }

          return fileName
        }

        const filePath = generateSeedFilePath()
        await nodeFs.promises.writeFile(filePath, input.worlds[worldIndex])
        filePaths.push(filePath)
      }

      return filePaths
    }),
  /**
   * Save a given universe preset as the special Last Config universe preset
   */
  saveLastSeedgenConfig: publicProcedure
    .input(
      z.object({
        universePreset: z.object(),
      })
    )
    .query(async ({input}): Promise<void> => {
      await nodeFs.promises.mkdir(getSeedgenUserDataPath(), {recursive: true})
      await nodeFs.promises.writeFile(getSeedgenUserDataPath("last_config.json"), JSON.stringify(input, null, 2), {encoding: "utf8"})
    }),
  /**
   * Save a given universe preset as the special Last Config universe preset
   */
  getLastSeedgenConfig: publicProcedure
    .query(async (): Promise<UniversePreset | null> => {
      const lastConfigPath = getSeedgenUserDataPath("last_config.json")

      if (!nodeFs.existsSync(lastConfigPath)) {
        return null
      }

      const fileContents = await nodeFs.promises.readFile(lastConfigPath, {encoding: "utf8"})
      return JSON.parse(fileContents) as UniversePreset
    }),
})
