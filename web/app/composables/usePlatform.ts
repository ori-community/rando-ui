import type {Platform} from "@shared/types/platform"


let platformCache: Platform | null = null


export async function usePlatform(): Promise<Platform> {
  if (platformCache === null) {
    const electronApi = useElectronApi()
    const launcherPlatform = await electronApi?.launcher.getPlatform.query()

    if (launcherPlatform) {
      platformCache = launcherPlatform
    } else {
      platformCache = "other"
    }
  }

  return platformCache
}
