import {publicProcedure, router} from "@launcher/api/trpc"
import {z} from "zod"
import {app, BrowserWindow, shell} from "electron"
import fs from "fs"
import {getUserDataPath} from "@launcher/paths"

export const auth = router({
  /**
   * Starts the OAuth2 authentication flow.
   * If this launcher is set as the default handler for the ori-rando://
   * protocol, it opens the login page in the default browser.
   * If not, or `forceWindowLogin` is true, opens the login page in
   * an embedded window.
   */
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

        return await new Promise<string>((resolve, reject) => {
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
  /**
   * Returns the saved client JWT, or null if it doesn't exist
   */
  getClientJwt: publicProcedure
    .query(async () => {
      const jwtFilePath = getUserDataPath(".jwt")
      if (fs.existsSync(jwtFilePath)) {
        return await fs.promises.readFile(getUserDataPath(".jwt"), {encoding: "utf8"})
      }

      return null
    }),
  /**
   * Sets the saved client JWT, or deletes it when the token is null.
   */
  setClientJwt: publicProcedure
    .input(z.object({
      jwt: z.nullable(z.string())
    }))
    .query(async ({input}) => {
      if (input.jwt === null) {
        const jwtFilePath = getUserDataPath(".jwt")
        if (fs.existsSync(jwtFilePath)) {
          await fs.promises.unlink(jwtFilePath)
        }
      } else {
        await fs.promises.writeFile(getUserDataPath(".jwt"), input.jwt, { encoding: "utf8" })
      }
    }),
})
