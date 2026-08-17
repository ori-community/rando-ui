import {publicProcedure, router} from "@launcher/api/trpc"
import {z} from "zod"
import {app, BrowserWindow, shell} from "electron"
import fs from "fs"
import {getRandomizerUserDataPath} from "@launcher/paths"
import {DEFAULT_PROTOCOL} from "@shared/utils/protocol"

export const auth = router({
  /**
   * Starts the OAuth2 authentication flow.
   * If this launcher is set as the default handler for the <DEFAULT_PROTOCOL>://
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
      if (app.isDefaultProtocolClient(DEFAULT_PROTOCOL) && !input.forceWindowLogin) {
        await shell.openExternal(`${input.apiBaseUrl}/login?redirect=${DEFAULT_PROTOCOL}:///authenticate`)
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

        await loginWindow.loadURL(`${input.apiBaseUrl}/login?redirect=${DEFAULT_PROTOCOL}:///authenticate`)

        return await new Promise<string>((resolve, reject) => {
          loginWindow.on("close", reject)

          loginWindow.webContents.on("will-redirect", (event, urlString) => {
            const url = new URL(urlString)

            if (url.protocol === `${DEFAULT_PROTOCOL}:`) {
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
      const jwtFilePath = getRandomizerUserDataPath(".jwt")
      if (fs.existsSync(jwtFilePath)) {
        return await fs.promises.readFile(getRandomizerUserDataPath(".jwt"), {encoding: "utf8"})
      }

      return null
    }),
  /**
   * Sets the saved client JWT, or deletes it when the token is null.
   */
  setClientJwt: publicProcedure
    .input(z.string().nullable())
    .query(async ({input}) => {
      if (input === null) {
        const jwtFilePath = getRandomizerUserDataPath(".jwt")
        if (fs.existsSync(jwtFilePath)) {
          await fs.promises.unlink(jwtFilePath)
        }
      } else {
        await fs.promises.writeFile(getRandomizerUserDataPath(".jwt"), input, { encoding: "utf8" })
      }
    }),
})
