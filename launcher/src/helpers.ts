export const getElectronUrl = (to: string) => {
  return process.env.NODE_ENV === "development"
    ? `http://localhost:3000#${to}`
    : `app://./index.html#${to}`
}

export enum Platform {
  Unknown = "unknown",
  Windows = "windows",
  Linux = "linux",
  Web = "web",
}

export function getPlatform(): Platform {
  switch (process.env.PLATFORM) {
    case "windows":
      return Platform.Windows
    case "linux":
      return Platform.Linux
    case "web":
      return Platform.Web
    default:
      return Platform.Unknown
  }
}

export function isPlatform(platform: Platform) {
  return getPlatform() === platform
}
