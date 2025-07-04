import type {Platform} from "@shared/types/platform"

export function usePlatform(): Platform {
  const runtimeConfig = useRuntimeConfig()

  const platform = runtimeConfig.public.platform
  console.log(runtimeConfig)

  switch (platform) {
    case "windows":
    case "linux":
    case "web":
      return platform
    default:
      return "unknown"
  }
}
