import {publicProcedure, router} from "@launcher/api/trpc"
import {z} from "zod"
import {LauncherService} from "@launcher/services/LauncherService"

export const launcher = router({
  /**
   * @see LauncherService.getPlatform
   */
  getPlatform: publicProcedure
    .query(() => {
      return LauncherService.getPlatform()
    }),
  /**
   * @see LauncherService.validateSetup
   */
  validateSetup: publicProcedure
    .query(async () => {
      return await LauncherService.validateSetup()
    }),
  /**
   * @see LauncherService.installOrUpdateProxyModloader
   */
  installOrUpdateProxyModloader: publicProcedure
    .query(async () => {
      await LauncherService.installOrUpdateProxyModloader()
    }),
  /**
   * @see LauncherService.launchOrFocusRandomizer
   */
  launchOrFocusRandomizer: publicProcedure
    .query(async () => {
      return await LauncherService.launchOrFocusRandomizer()
    }),
  /**
   * @see LauncherService.getGameLaunchMethodsAvailableOnPlatform
   */
  getGameLaunchMethodsAvailableOnPlatform: publicProcedure
    .query(async () => {
      return await LauncherService.getGameLaunchMethodsAvailableOnPlatform()
    }),
  /**
   * @see LauncherService.getModloaderMethodsAvailableOnPlatform
   */
  getModloaderMethodsAvailableOnPlatform: publicProcedure
    .query(async () => {
      return await LauncherService.getModloaderMethodsAvailableOnPlatform()
    }),
  /**
   * @see LauncherService.getModloaderMethodsAvailableOnForGameLaunchMethod
   */
  getModloaderMethodsAvailableOnForGameLaunchMethod: publicProcedure
    .input(z.string())
    .query(async ({input}) => {
      return await LauncherService.getModloaderMethodsAvailableOnForGameLaunchMethod(input as Settings['GameLaunchMethod'])
    }),
})
