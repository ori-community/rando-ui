import nodeFs from "node:fs"
import os from "node:os"
import path from "node:path"
import {publicProcedure, router} from "@launcher/api/trpc"
import {
  getInstallDataPath,
  getSeedgenUserDataPath,
  getSeedsUserDataPath,
  getTemporaryUserDataPath,
} from "@launcher/paths"
import {SeedgenUiState} from "@shared/types/seedgen-extra"
import {app} from "electron"
import {z} from "zod"
import {execa} from "execa"

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
      }),
    )
    .query(async ({input}): Promise<string[]> => {
      const seedsDir = getSeedsUserDataPath()
      await nodeFs.promises.mkdir(seedsDir, {recursive: true})

      const id = Date.now()

      const filePaths = []
      for (let worldIndex = 0; worldIndex < input.worlds.length; worldIndex++) {
        const generateSeedFilePath = (offset: number = 0) => {
          let fileName = input.worlds.length === 1 ? `${id}` : `${id}-${worldIndex}`

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
  saveLastSeedgenUiState: publicProcedure
    .input(
      z.object({
        seedgenUiState: z.any(),
      }),
    )
    .query(async ({input}): Promise<void> => {
      await nodeFs.promises.mkdir(getSeedgenUserDataPath(), {recursive: true})
      await nodeFs.promises.writeFile(
        getSeedgenUserDataPath("last_seedgen_ui_state.json"),
        JSON.stringify(input.seedgenUiState, null, 2),
        {encoding: "utf8"},
      )
    }),
  /**
   * Save a given universe preset as the special Last Config universe preset
   */
  getLastSeedgenUiState: publicProcedure.query(async (): Promise<SeedgenUiState | null> => {
    const lastSettingsPath = getSeedgenUserDataPath("last_seedgen_ui_state.json")

    if (!nodeFs.existsSync(lastSettingsPath)) {
      return null
    }

    const fileContents = await nodeFs.promises.readFile(lastSettingsPath, {encoding: "utf8"})
    return JSON.parse(fileContents) as SeedgenUiState
  }),
  /**
   * Save a given world user preset to disk
   */
  saveWorldPreset: publicProcedure
    .input(
      z.object({
        name: z.string(),
        preset: z.any(),
      }),
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
      }),
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
        id: z.string(),
      }),
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
        id: z.string(),
      }),
    )
    .query(async ({input}): Promise<void> => {
      await nodeFs.promises.rm(getSeedgenUserDataPath(`universe_presets/${input.id}.json`), {force: true})
    }),
  /**
   * Integrates into Linux desktop environments using standard XDG tools
   */
  integrateIntoLinuxDesktop: publicProcedure.query(async (): Promise<void> => {
    if (os.platform() !== "linux") {
      throw new Error("Unable to create a desktop entry on non-linux platforms")
    }

    const desktopFileContents = [
      "[Desktop Entry]",
      "Type=Application",
      "Version=1.5",
      "Terminal=false",
      "Categories=Game;",
      "Name=Ori and the Will of the Wisps Randomizer",
      "StartupWMClass=ori-and-the-will-of-the-wisps-randomizer",
      "SingleMainWindow=true",
      "MimeType=application/x.ori-wotw-randomizer-seed;",
      "Icon=com.orirando.wotw-randomizer",
    ]

    if (process.env.APPIMAGE) {
      desktopFileContents.push(
        `Exec="${process.env.APPIMAGE}" %F`,
      )
    } else {
      desktopFileContents.push(
        `Exec="${app.getPath("exe")}" %F`,
        `Path=${getInstallDataPath()}`,
      )
    }

    const temporaryDesktopFilePath = getTemporaryUserDataPath("com.orirando.wotw-randomizer.desktop")
    await nodeFs.promises.writeFile(temporaryDesktopFilePath, `${desktopFileContents.join("\n")}\n`)

    const mimeFileContents = [
      `<?xml version="1.0"?>`,
      `<mime-info xmlns='http://www.freedesktop.org/standards/shared-mime-info'>`,
      `    <mime-type type="application/x.ori-wotw-randomizer-seed">`,
      `        <comment>Ori and the Will of the Wisps Randomizer Seed</comment>`,
      `        <glob pattern="*.wotwr"/>`,
      `        <icon name="com.orirando.wotw-randomizer"/>`,
      `    </mime-type>`,
      `</mime-info>`,
    ]
    const temporaryMimeFilePath = getTemporaryUserDataPath("com.orirando.wotw-seed.xml")
    await nodeFs.promises.writeFile(temporaryMimeFilePath, `${mimeFileContents.join("\n")}\n`)

    await execa("xdg-icon-resource", ["install", "--size", "256", getInstallDataPath("icon.png"), "com.orirando.wotw-randomizer"])
    await execa("xdg-desktop-menu", ["install", temporaryDesktopFilePath])
    await execa("xdg-mime", ["install", temporaryMimeFilePath])
    await execa("xdg-mime", ["default", "com.orirando.wotw-randomizer.desktop", "application/x.ori-wotw-randomizer-seed"])
  }),
  /**
   * Returns a full path to the installation data directory, or a path within.
   */
  getInstallDataPath: publicProcedure.input(z.string().optional()).query(async ({input}): Promise<string> => {
    return getInstallDataPath(input)
  }),
})
