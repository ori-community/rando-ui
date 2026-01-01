import {publicProcedure, router} from "@launcher/api/trpc"
import {z} from "zod"
import {LauncherService} from "@launcher/services/LauncherService"
import {observable} from "@trpc/server/observable"
import {LaunchResult} from "@shared/types/launcher"
import {Settings} from "@shared/types/settings"

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
  /**
   * Subscribe to get the isLaunching state of LauncherService
   * Will emit its current value on subscription.
   */
  isLaunching: publicProcedure
    .subscription(() => {
      return observable<boolean>((emit) => {
        const onIsLaunchingChanged = (value: boolean) => emit.next(value)
        LauncherService.events.on("isLaunchingChanged", onIsLaunchingChanged)

        emit.next(LauncherService.isLaunching)

        return () => {
          LauncherService.events.off("isLaunchingChanged", onIsLaunchingChanged)
        }
      })
    }),
  /**
   * Subscribe to get LaunchResults when LauncherService launches the game or fails to do so.
   */
  onLaunchResult: publicProcedure
    .subscription(() => {
      return observable<LaunchResult>((emit) => {
        const onLaunchResult = (value: LaunchResult) => emit.next(value)
        LauncherService.events.on("onLaunchResult", onLaunchResult)

        return () => {
          LauncherService.events.off("onLaunchResult", onLaunchResult)
        }
      })
    }),
})
