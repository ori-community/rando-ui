import * as os from 'os'

export enum Platform {
  Unknown,
  Windows,
  Linux,
}

export function getOS(): Platform {
  const currentPlatform = os.platform()

  switch (currentPlatform) {
    case 'win32': return Platform.Windows
    case 'linux': return Platform.Linux
    default: return Platform.Unknown
  }
}

export function isOS(platform: Platform) {
  return getOS() === platform
}
