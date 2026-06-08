import {publicProcedure, router} from "@launcher/api/trpc"
import {UpdateService} from "@launcher/services/UpdateService"
import {observable} from "@trpc/server/observable"
import z from "zod"

export const updater = router({
  /**
   * Returns the version string, or "develop" if no version is specified.
   */
  getVersion: publicProcedure
    .query(async () => {
      return await UpdateService.getVersion()
    }),

  downloadAndInstallUpdate: publicProcedure
    .input(
      z.object({
        windowsInstallerUrl: z.httpUrl(),
        linuxAppImageUrl: z.httpUrl(),
        linuxPortableUrl: z.httpUrl(),
      })
    )
    .query(async ({input}) => {
      await UpdateService.downloadAndInstallUpdate({
        windowsInstaller: input.windowsInstallerUrl,
        linuxAppimage: input.linuxAppImageUrl,
        linuxPortable: input.linuxPortableUrl,
      })
    }),

  /**
   * Subscribe to get the download progress
   */
  updateDownloadProgress: publicProcedure
    .subscription(() => {
      return observable<number | null>((emit) => {
        const onUpdateDownloadProgressChanged = (value: number | null) => emit.next(value)
        UpdateService.events.on("updateDownloadProgressChanged", onUpdateDownloadProgressChanged)

        emit.next(UpdateService.updateDownloadProgress)

        return () => {
          UpdateService.events.off("updateDownloadProgressChanged", onUpdateDownloadProgressChanged)
        }
      })
    }),
})
