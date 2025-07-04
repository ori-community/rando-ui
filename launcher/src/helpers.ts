import type {Platform} from "@shared/types/platform"

export const getElectronUrl = (to: string) => {
  return process.env.NODE_ENV === "development"
    ? `http://localhost:3000${to}`
    : `app://./index.html#${to}`
}

export function getPlatform(): Platform {
  const platform = process.env.PLATFORM

  switch (platform) {
    case "windows":
    case "linux":
    case "web":
      return platform
    default:
      return "unknown"
  }
}
