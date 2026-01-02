import type {LaunchResult} from "@shared/types/launcher"
import {type EventBusKey, useEventBus, type UseEventBusReturn} from "@vueuse/core"

type LauncherHelper = {
  isLaunching: Ref<boolean>,
  launch: (newGameSeedSource?: string | undefined) => Promise<LaunchResult>,
  onLaunchResult: UseEventBusReturn<LaunchResult, unknown>,
}

let instance: LauncherHelper | null = null

export const useLauncherHelper = (): LauncherHelper => {
  if (!instance) {
    const electronApi = useElectronApi()
    const isLaunching = ref(false)
    const onLaunchResultKey: EventBusKey<LaunchResult> = Symbol("launcher-helper-on-launch-result")
    const onLaunchResult = useEventBus(onLaunchResultKey)

    if (electronApi) {
      electronApi.launcher.isLaunching.subscribe(undefined, {
        onData(value) {
          isLaunching.value = value
        },
      })

      electronApi.launcher.onLaunchResult.subscribe(undefined, {
        onData(value) {
          onLaunchResult.emit(value)
        },
      })
    }

    const launch = async (newGameSeedSource: string | undefined = undefined): Promise<LaunchResult> => {
      const launchWrapper = async(): Promise<LaunchResult> => {
        if (!electronApi) {
          return {
            launchedSuccessfully: false,
            errorType: "unknown_error",
            errorMessage: "Electron API is unavailable",
          }
        }

        try {
          return await electronApi.launcher.launchOrFocusRandomizer.query(newGameSeedSource)
        } catch (e) {
          return {
            launchedSuccessfully: false,
            errorType: "unknown_error",
            errorMessage: String(e),
          }
        }
      }

      return await launchWrapper()
    }

    instance = {isLaunching, launch, onLaunchResult}
  }

  return instance
}
