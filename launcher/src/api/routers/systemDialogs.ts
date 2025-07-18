import {publicProcedure, router} from "@launcher/api/trpc"
import {z} from "zod"
import {dialog} from "electron"

export const systemDialogs = router({
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
      const result = await dialog.showOpenDialog({
        defaultPath: input.defaultPath,
        properties: ['openFile'],
        filters: input.filters,
      })

      if (!result.canceled) {
        return result.filePaths[0]
      }

      return null
    })
})
