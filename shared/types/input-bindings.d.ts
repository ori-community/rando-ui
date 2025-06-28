export type VanillaAction =
  "MainMenuSaveCopy" |
  "MainMenuSaveDelete" |
  "Interact" |
  "Jump" |
  "Ability1" |
  "Ability2" |
  "Ability3" |
  "Glide" |
  "Grab" |
  "Dash" |
  "Burrow" |
  "Bash" |
  "Grapple" |
  "DialogueAdvance" |
  "DialogueOption1" |
  "DialogueOption2" |
  "DialogueOption3" |
  "DialogueExit" |
  "OpenMapsShardsInventory" |
  "OpenWeaponWheel" |
  "PauseScreen" |
  "LiveSignIn" |
  "MapZoomIn" |
  "MapZoomOut" |
  "MenuSelect" |
  "MenuBack" |
  "MenuClose" |
  "MenuDown" |
  "MenuUp" |
  "MenuLeft" |
  "MenuRight" |
  "MenuPageLeft" |
  "MenuPageRight" |
  "LeaderboardCycleFilter" |
  "MapFilter" |
  "MapDetails" |
  "MapFocusOri" |
  "MapFocusObjective"

export type RandoAction =
  "OpenRandoWheel" |
  "QuickBuy" |
  "ToggleBingoBoardOverlay" |
  "Binding1" |
  "Binding2" |
  "Binding3" |
  "Binding4" |
  "Binding5" |
  "ServerReconnect" |
  "ReloadSeed" |
  "ShowFlags" |
  "ShowLastPickup" |
  "ShowProgressWithHints" |
  "WarpCredits" |
  "ToggleCursorLock" |
  "ShowDevFlag" |
  "ToggleDebug" |
  "PrintCoordinates" |
  "TeleportCheat" |
  "UnlockSpoilers" |
  "TogglePickupNamesOnSpoiler" |
  "ForceExit"

export type Action = VanillaAction & RandoAction

type ControllerBinding = number[][]

export type ControllerBindings = {
  [key in Action]: ControllerBinding
}

export type KeyboardBinding = {keys: number[], respects_modifiers?: boolean}[]

export type KeyboardBindings = {
  [key in RandoAction]: KeyboardBinding
}
