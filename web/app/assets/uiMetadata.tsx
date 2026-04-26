import type {Settings} from "@shared/types/settings"
import type {LaunchSetupValidationError} from "@shared/types/launcher"
import type {Platform} from "@shared/types/platform"

export const gameLaunchMethodsMetadata: {
  [key in Settings["GameLaunchMethod"]]: {
    name: string,
    descriptionComponent: (platform: Platform) => JSX.Element,
    alerts?: {[platform in Platform]?: JSX.Element}
  }
} = {
  "steam": {
    name: "Steam",
    descriptionComponent: (platform) => {
      switch (platform) {
        case "windows":
          return <span><strong><em>Recommended if you have the game on Steam.</em></strong> Launch the game through Steam.</span>;
        case "linux":
        case "other":
        default:
          return <span>Launch the game through Steam. Requires manual setup on Linux but can lead to better performance. If you don't want to do manual setup, try "Standalone" first.</span>
      }
    },
    alerts: {
      linux: <div>
        <div>
          <strong>
            Steam on Linux requires some manual setup steps and is only recommended if you are experiencing
            performance issues.<br />
            Try "Standalone" first.
          </strong>
        </div>
        <div class="mt-3">
          Read everything carefully!
          <ol>
            <li>Start the vanilla game at least once</li>
            <li>Right-click the game in Steam and go to Properties → General</li>
            <li>Set Launch Options to <code class="bg-warning-lighten-1 pa-1">WINEDLLOVERRIDES=winhttp.dll=n,b %command%</code></li>
            <li>Install the required runtime dependencies using Protontricks: <code class="bg-warning-lighten-1 pa-1">protontricks 1057090 vcrun2022</code></li>
          </ol>
        </div>
        <div class="mt-3">
          If the game does not start or crashes at startup:
          <ul>
            <li>Check that you are using the latest version of Proton available</li>
            <li>
              If you have started the game before, you might need to delete its Proton Prefix. For that, delete the directory
              <code class="bg-warning-lighten-1 pa-1">&lt;Steam Root&gt;/steamapps/compatdata/1057090</code> and try again.
            </li>
          </ul>
        </div>
      </div>
    }
  },
  "standalone": {
    name: "Standalone",
    descriptionComponent: (platform) => {
      switch (platform) {
        case "windows":
          return <span>Launch the game binary directly. Use this if you want to launch the game directly.</span>;
        case "linux":
        case "other":
        default:
          return <span><strong><em>Recommended.</em></strong> Launch the game binary directly through Wine.</span>
      }
    },
  },
  "microsoft-store": {
    name: "Microsoft Store",
    descriptionComponent: () => <span>Launch the game through the Microsoft Store. Pick this if you have installed the Microsoft Store version of the game.</span>,
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
