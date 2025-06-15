import {publicProcedure, router} from "../trpc"
import {z} from "zod"
import {app, BrowserWindow, shell} from "electron"
import fs from "fs"
import {getUserDataPath} from "../../paths"

export default router({
  startOAuthFlow: publicProcedure
    .input(z.object({
      apiBaseUrl: z.string(),
      forceWindowLogin: z.boolean().optional(),
    }))
    .query(async ({input}) => {
      if (app.isDefaultProtocolClient("ori-rando") && !input.forceWindowLogin) {
        await shell.openExternal(`${input.apiBaseUrl}/login?redirect=ori-rando://authenticate`)
      } else {
        const loginWindow = new BrowserWindow({
          width: 800,
          height: 600,
          autoHideMenuBar: true,
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
          },
        })

        await loginWindow.loadURL(`${input.apiBaseUrl}/login?redirect=ori-rando://authenticate`)

        return await new Promise((resolve, reject) => {
          loginWindow.on("close", reject)

          loginWindow.webContents.on("will-redirect", (event, urlString) => {
            const url = new URL(urlString)

            if (url.protocol === "ori-rando:") {
              event.preventDefault()
              resolve(url.searchParams.get("jwt"))
              loginWindow.close()
            }
          })
        })
      }
    }),
  getClientJwt: publicProcedure
    .query(async () => {
      const jwtFilePath = getUserDataPath(".jwt")
      if (fs.existsSync(jwtFilePath)) {
        return await fs.promises.readFile(getUserDataPath(".jwt"), {encoding: "utf8"})
      }

      return null
    }),
  setClientJwt: publicProcedure
    .input(z.string())
    .query(async ({input}) => {
      await fs.promises.writeFile(getUserDataPath(".jwt"), input, { encoding: "utf8" })
    }),
  deleteClientJwt: publicProcedure
    .query(async () => {
      const jwtFilePath = getUserDataPath(".jwt")
      if (fs.existsSync(jwtFilePath)) {
        await fs.promises.unlink(jwtFilePath)
      }
    })
})
