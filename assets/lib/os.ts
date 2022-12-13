export enum Platform {
  Unknown,
  Windows,
  Linux,
  Web,
}

export function getOS(): Platform {
  switch (process.env.PLATFORM) {
    case 'win32': return Platform.Windows
    case 'linux': return Platform.Linux
    case 'web': return Platform.Web
    default: return Platform.Unknown
  }
}

export function isOS(platform: Platform) {
  return getOS() === platform
}
