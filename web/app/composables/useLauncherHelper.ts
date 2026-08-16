import type {LaunchResult} from "@shared/types/launcher"

type LauncherHelper = {
  newGameSeedSource: Ref<string | null>,
  isLaunching: Ref<boolean>,
  launch: (newGameSeedSource?: string | undefined) => Promise<LaunchResult>,
  launchResult: Ref<LaunchResult | null>,
}

let instance: LauncherHelper | null = null

export const useLauncherHelper = (): LauncherHelper => {
  if (!instance) {
    const electronApi = useElectronApi()
    const isLaunching = ref(false)
    const newGameSeedSource = ref<string | null>(null)
    const launchResult = ref<LaunchResult | null>(null)

    if (electronApi) {
      electronApi.launcher.newGameSeedSource.subscribe(undefined, {
        onData(value) {
          newGameSeedSource.value = value
        },
      })

      electronApi.launcher.isLaunching.subscribe(undefined, {
        onData(value) {
          isLaunching.value = value
        },
      })

      electronApi.launcher.launchResult.subscribe(undefined, {
        onData(value) {
          launchResult.value = value
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

    instance = {isLaunching, newGameSeedSource, launch, launchResult}
  }

  return instance
}
