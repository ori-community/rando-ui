import {publicProcedure, router} from "@launcher/api/trpc"
import {z} from "zod"
import {getSeedgenUserDataPath, getSeedsUserDataPath} from "@launcher/paths"
import nodeFs from "node:fs"
import path from "node:path"
import {UniverseSettings} from "@shared/types/seedgen"

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
  saveLastSeedgenSettings: publicProcedure
    .input(
      z.object({
        universeSettings: z.any(),
      })
    )
    .query(async ({input}): Promise<void> => {
      await nodeFs.promises.mkdir(getSeedgenUserDataPath(), {recursive: true})
      await nodeFs.promises.writeFile(getSeedgenUserDataPath("last_settings.json"), JSON.stringify(input.universeSettings, null, 2), {encoding: "utf8"})
    }),
  /**
   * Save a given universe preset as the special Last Config universe preset
   */
  getLastSeedgenSettings: publicProcedure
    .query(async (): Promise<UniverseSettings | null> => {
      const lastSettingsPath = getSeedgenUserDataPath("last_settings.json")

      if (!nodeFs.existsSync(lastSettingsPath)) {
        return null
      }

      const fileContents = await nodeFs.promises.readFile(lastSettingsPath, {encoding: "utf8"})
      return JSON.parse(fileContents) as UniverseSettings
    }),
  /**
   * Save a given world user preset to disk
   */
  saveWorldPreset: publicProcedure
    .input(
      z.object({
        name: z.string(),
        preset: z.any(),
      })
    )
    .query(async ({input}): Promise<void> => {
      await nodeFs.promises.mkdir(getSeedgenUserDataPath("world_presets"), {recursive: true})

      const trimmedInputName = input.name.trim()
      const filename = trimmedInputName.replaceAll(/[^a-zA-Z0-9\-_]/g, "_")

      let count = 0
      while (true) {
        const fullFilename = filename + (count > 0 ? `_${count + 1}` : "")
        const path = getSeedgenUserDataPath(`world_presets/${fullFilename}.json`)

        if (!nodeFs.existsSync(path)) {
          await nodeFs.promises.writeFile(path, JSON.stringify(input.preset, null, 2), {encoding: "utf8"})
          return
        }

        count++
      }
    }),
  /**
   * Save a given universe user preset to disk
   */
  saveUniversePreset: publicProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        preset: z.any(),
      })
    )
    .query(async ({input}): Promise<void> => {
      await nodeFs.promises.mkdir(getSeedgenUserDataPath("universe_presets"), {recursive: true})

      const trimmedInputName = input.name.trim()
      const filename = trimmedInputName.replaceAll(/[^a-zA-Z0-9\-_]/g, "_")

      let count = 0
      while (true) {
        const fullFilename = filename + (count > 0 ? `_${count + 1}` : "")
        const path = getSeedgenUserDataPath(`universe_presets/${fullFilename}.json`)

        if (!nodeFs.existsSync(path)) {
          await nodeFs.promises.writeFile(path, JSON.stringify(input.preset, null, 2), {encoding: "utf8"})
          return
        }

        count++
      }
    }),
  /**
   * Delete a given world user preset from disk
   */
  deleteWorldPreset: publicProcedure
    .input(
      z.object({
        id: z.string()
      })
    )
    .query(async ({input}): Promise<void> => {
      await nodeFs.promises.rm(getSeedgenUserDataPath(`world_presets/${input.id}.json`), {force: true})
    }),
  /**
   * Delete a given universe user preset from disk
   */
  deleteUniversePreset: publicProcedure
    .input(
      z.object({
        id: z.string()
      })
    )
    .query(async ({input}): Promise<void> => {
      await nodeFs.promises.rm(getSeedgenUserDataPath(`universe_presets/${input.id}.json`), {force: true})
    }),
})
