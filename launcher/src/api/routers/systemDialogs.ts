import {publicProcedure, router} from "@launcher/api/trpc"
import {z} from "zod"
import {dialog, shell} from "electron"
import {getMainWindow} from "@launcher/main"

export const systemDialogs = router({
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
      shell.showItemInFolder(input.path)
    })
})
