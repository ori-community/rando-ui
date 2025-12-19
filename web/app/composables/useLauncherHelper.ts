import type {LaunchResult} from "@shared/types/launcher"
import {type EventBusKey, useEventBus, type UseEventBusReturn} from "@vueuse/core"

type LauncherHelper = {
  isLaunching: Ref<boolean>,
  launch: () => Promise<LaunchResult>,
  onLaunchResult: UseEventBusReturn<LaunchResult, unknown>,
}

let instance: LauncherHelper | null = null

export const useLauncherHelper = (): LauncherHelper => {
  if (!instance) {
    const electronApi = useElectronApi()
    const isLaunching = ref(false)
    const onLaunchResultKey: EventBusKey<LaunchResult> = Symbol("launcher-helper-on-launch-result")
    const onLaunchResult = useEventBus(onLaunchResultKey)

    const launch = async (): Promise<LaunchResult> => {
      const launchWrapper = async(): Promise<LaunchResult> => {
        if (!electronApi) {
          return {
            launchedSuccessfully: false,
            errorType: "unknown_error",
            errorMessage: "Electron API was not available",
          }
        }

        try {
          return await electronApi.launcher.launchOrFocusRandomizer.query()
        } catch (e) {
          return {
            launchedSuccessfully: false,
            errorType: "unknown_error",
            errorMessage: String(e),
          }
        }
      }

      isLaunching.value = true
      const result = await launchWrapper()
      onLaunchResult.emit(result)
      isLaunching.value = false
      return result
    }

    instance = {isLaunching, launch, onLaunchResult}
  }

  return instance
}
