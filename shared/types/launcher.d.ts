export type LaunchSetupValidationError =
  "proxy-and-microsoft-store-incompatible" |
  "invalid-game-binary-path" |
  "invalid-steam-binary-path" |
  "invalid-proxy-modloader-file" |
  "game-launch-method-not-available-on-current-platform" |
  "modloader-method-not-available-on-current-platform"

export type LaunchResult = {
  launchedSuccessfully: true,
} | {
  launchedSuccessfully: false,
  setupValidationErrors: LaunchSetupValidationError[],
}
