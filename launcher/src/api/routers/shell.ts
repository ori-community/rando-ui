import {publicProcedure, router} from "@launcher/api/trpc"
import {z} from "zod"
import {dialog, shell as electronShell} from "electron"
import {getMainWindow} from "@launcher/main"
import {getSeedsUserDataPath, getUserDataPath} from "@launcher/paths"
import {promises as fsPromises} from "node:fs"
import fs from "fs"
import log from "electron-log/main"

async function openFileOrFolderInExplorer(path: string) {
  if (!fs.existsSync(path)) {
    log.error(`Tried to open path in explorer but path doesn't exist: ${path}`)
    return
  }

  if ((await fsPromises.lstat(path)).isDirectory()) {
    await electronShell.openPath(path)
  } else {
    electronShell.showItemInFolder(path)
  }
}

export const shell = router({
  /**
   * Show a file picker ("Open File dialog") with specified filters
   * and default path
   */
  pickFile: publicProcedure
    .input(
      z.object({
        defaultPath: z.string().optional(),
        filters: z.array(z.object({
          name: z.string(),
          extensions: z.array(z.string())
        })),
      })
    )
    .query(async ({input}): Promise<string | null> => {
      const result = await dialog.showOpenDialog(getMainWindow(), {
        defaultPath: input.defaultPath,
        properties: ['openFile'],
        filters: input.filters,
      })

      if (!result.canceled) {
        return result.filePaths[0]
      }

      return null
    }),
  /**
   * Display a path in the default file explorer
   */
  showPathInExplorer: publicProcedure
    .input(
      z.object({
        path: z.string(),
      })
    )
    .query(async ({input}): Promise<void> => {
      await openFileOrFolderInExplorer(input.path)
    }),
  /**
   * Display a well-known path in the default file explorer
   */
  showWellKnownPathInExplorer: publicProcedure
    .input(
      z.object({
        wellKnownPath: z.enum(["user-data", "seeds"]),
      })
    )
    .query(async ({input}): Promise<void> => {
      switch (input.wellKnownPath) {
        case "user-data":
          await openFileOrFolderInExplorer(getUserDataPath())
          break
        case "seeds":
          await openFileOrFolderInExplorer(getSeedsUserDataPath())
          break
      }
    }),
  /**
   * Open a URL
   */
  openUrl: publicProcedure
    .input(
      z.object({
        url: z.string(),
      })
    )
    .query(async ({input}): Promise<void> => {
      await electronShell.openExternal(input.url)
    }),
})
