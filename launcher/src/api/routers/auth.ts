import { publicProcedure, router } from '../trpc'
import { z } from 'zod'
import { app, BrowserWindow, shell } from 'electron'

export default router({
  startOAuthFlow: publicProcedure
    .input(z.object({
      baseUrl: z.string(),
      forceWindowLogin: z.boolean().optional(),
    }))
    .query(async ({ input }) => {
      if (app.isDefaultProtocolClient('ori-rando') && !input.forceWindowLogin) {
        await shell.openExternal(`${input.baseUrl}/login?redirect=ori-rando://authenticate`)
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

        await loginWindow.loadURL(`${input.baseUrl}/login?redirect=ori-rando://authenticate`)

        return await new Promise((resolve, reject) => {
          loginWindow.on('close', reject)

          loginWindow.webContents.on('will-redirect', (event, urlString) => {
            const url = new URL(urlString)

            if (url.protocol === 'ori-rando:') {
              event.preventDefault()
              resolve(url.searchParams.get('jwt'))
              loginWindow.close()
            }
          })
        })
      }
    }),
})
