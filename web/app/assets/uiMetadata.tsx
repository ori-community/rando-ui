import type {Settings} from "@shared/types/settings"
import type {LaunchSetupValidationError} from "@shared/types/launcher"

export const gameLaunchMethodsMetadata: {
  [key in Settings["GameLaunchMethod"]]: {
    name: string,
    descriptionComponent: JSX.Element
  }
} = {
  "steam": {
    name: "Steam",
    descriptionComponent: <span>Launch the game through Steam. Pick this if you have the game on Steam.</span>,
  },
  "microsoft-store": {
    name: "Microsoft Store",
    descriptionComponent: <span>Launch the game through the Microsoft Store. Pick this if you have installed the Microsoft Store version of the game.</span>,
  },
  "standalone": {
    name: "Standalone",
    descriptionComponent:
      <span>Launch the game binary directly. Use this if you want to launch the game directly.</span>,
  },
}

export const modloaderMethodsMetadata: {
  [key in Settings["ModloaderMethod"]]: {
    name: string,
    descriptionComponent: JSX.Element
  }
} = {
  "proxy": {
    name: "Proxy",
    descriptionComponent: <span>
      <strong><em>Recommended if available.</em></strong> Places a small file into the game files.
      This requires admin privileges on install and when that file needs an update.
    </span>,
  },
  "inject": {
    name: "Injector",
    descriptionComponent: <span>
      Uses an injector to inject the randomizer into the game when launching. Requires admin privileges every time.
    </span>,
  },
}

export const launchSetupValidationErrorMessages: { [key in LaunchSetupValidationError]: string } = {
  "modloader-method-not-available-for-game-launch-method": "The selected modloader method is not compatible with the selected game launch method.",
  "modloader-method-not-available-on-current-platform": "The selected modloader method is not available on the current platform.",
  "invalid-game-binary-path": "The path to the game binary is invalid.",
  "invalid-steam-binary-path": "The path to Steam is invalid.",
  "invalid-proxy-modloader-file": "The proxy modloader is not installed correctly.",
  "game-launch-method-not-available-on-current-platform": "The selected game launch method is not available on the current platform.",
}
