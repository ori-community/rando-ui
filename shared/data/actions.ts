import {ControllerInput, KeyboardAndMouseInput} from "./input"

export const gameActions = [
  "MainMenuSaveCopy",
  "MainMenuSaveDelete",
  "Interact",
  "Jump",
  "Ability1",
  "Ability2",
  "Ability3",
  "Glide",
  "Grab",
  "Dash",
  "Burrow",
  "Bash",
  "Grapple",
  "DialogueAdvance",
  "DialogueOption1",
  "DialogueOption2",
  "DialogueOption3",
  "DialogueExit",
  "OpenMapsShardsInventory",
  "OpenAreaMap",
  "OpenInventory",
  "OpenWorldMap",
  "OpenShards",
  "OpenWeaponWheel",
  "PauseScreen",
  "LiveSignIn",
  "MapZoomIn",
  "MapZoomOut",
  "MenuSelect",
  "MenuBack",
  "MenuClose",
  "MenuDown",
  "MenuUp",
  "MenuLeft",
  "MenuRight",
  "MenuPageLeft",
  "MenuPageRight",
  "LeaderboardCycleFilter",
  "MapFilter",
  "MapDetails",
  "MapFocusOri",
  "MapFocusObjective",
  "Left",
  "Right",
  "Up",
  "Down",
  "OpenRandomizerWheel",
  "QuickBuy",
  "Binding1",
  "Binding2",
  "Binding3",
  "Binding4",
  "Binding5",
  "ReconnectToServer",
  "ReloadSeed",
  "ShowSeedTags",
  "ShowRecentPickups",
  "ShowProgressWithHints",
  "ToggleCursorLock",
  "ToggleDebug",
  "ToggleBingoBoardOverlay",
] as const

export type GameAction = (typeof gameActions)[number]

export const gameActionCategories = [
  "General",
  "MainMenu",
  "Menu",
  "Wheel",
  "Dialogue",
  "Map",
  "Randomizer",
] as const

export type GameActionCategory = (typeof gameActionCategories)[number]

export type GameActionCategoryMetadata = {
  name: string,
};

export const gameActionCategoryMetadata: Record<GameActionCategory, GameActionCategoryMetadata> = {
  Dialogue: {
    name: "Dialogue",
  },
  General: {
    name: "General",
  },
  MainMenu: {
    name: "Main Menu",
  },
  Map: {
    name: "Map",
  },
  Menu: {
    name: "Menu",
  },
  Randomizer: {
    name: "Randomizer",
  },
  Wheel: {
    name: "Wheel",
  },
}

export type GameActionMetadata = {
  name: string,
  category: GameActionCategory,
  description?: string,
  /**
   * false = not rebindable
   * single = rebindable to single inputs
   * composable = rebindable to a single inputs or input combinations (e.g. LT + RT)
   */
  controller: false | {
    type: "single",
    default: ControllerInput[],
  } | {
    type: "composable",
    default: ControllerInput[][],
  },
  /**
   * false = not rebindable
   * in-game = rebindable in-game (for displaying a hint)
   * composable = rebindable to single inputs or input combination (e.g. Alt + 1)
   */
  keyboardAndMouse: false | "in-game" | {
    type: "composable",
    default: {
      inputs: KeyboardAndMouseInput[],
      /** Whether modifier keys (Ctrl/Alt/Shift...) must match exactly */
      exactModifiers: boolean,
    }[],
  },
}

export const gameActionMetadata = {
  MainMenuSaveCopy: {
    name: "Copy Save File",
    category: "MainMenu",
    controller: {
      type: "single",
      default: ["ButtonX"],
    },
    keyboardAndMouse: "in-game",
  },
  MainMenuSaveDelete: {
    name: "Delete Save File",
    category: "MainMenu",
    controller: {
      type: "single",
      default: ["ButtonY"],
    },
    keyboardAndMouse: "in-game",
  },
  Interact: {
    name: "Interact",
    category: "General",
    controller: {
      type: "single",
      default: ["ButtonX"],
    },
    keyboardAndMouse: "in-game",
  },
  Jump: {
    name: "Jump",
    category: "General",
    controller: {
      type: "single",
      default: ["ButtonA"],
    },
    keyboardAndMouse: "in-game",
  },
  Ability1: {
    name: "Ability 1",
    category: "General",
    controller: {
      type: "single",
      default: ["ButtonX"],
    },
    keyboardAndMouse: "in-game",
  },
  Ability2: {
    name: "Ability 2",
    category: "General",
    controller: {
      type: "single",
      default: ["ButtonY"],
    },
    keyboardAndMouse: "in-game",
  },
  Ability3: {
    name: "Ability 3",
    category: "General",
    controller: {
      type: "single",
      default: ["ButtonB"],
    },
    keyboardAndMouse: "in-game",
  },
  Glide: {
    name: "Glide",
    category: "General",
    controller: {
      type: "single",
      default: ["RightTrigger"],
    },
    keyboardAndMouse: "in-game",
  },
  Grab: {
    name: "Grab",
    category: "General",
    controller: {
      type: "single",
      default: ["RightTrigger"],
    },
    keyboardAndMouse: "in-game",
  },
  Dash: {
    name: "Dash",
    category: "General",
    controller: {
      type: "single",
      default: ["RightShoulder"],
    },
    keyboardAndMouse: "in-game",
  },
  Burrow: {
    name: "Burrow",
    category: "General",
    controller: {
      type: "single",
      default: ["RightShoulder"],
    },
    keyboardAndMouse: "in-game",
  },
  Bash: {
    name: "Bash",
    category: "General",
    controller: {
      type: "single",
      default: ["LeftShoulder"],
    },
    keyboardAndMouse: "in-game",
  },
  Grapple: {
    name: "Grapple",
    category: "General",
    controller: {
      type: "single",
      default: ["LeftShoulder"],
    },
    keyboardAndMouse: "in-game",
  },
  DialogueAdvance: {
    name: "Advance",
    category: "Dialogue",
    controller: {
      type: "single",
      default: ["ButtonA", "ButtonB", "ButtonX", "ButtonY"],
    },
    keyboardAndMouse: "in-game",
  },
  DialogueOption1: {
    name: "Option 1",
    category: "Dialogue",
    controller: {
      type: "single",
      default: ["ButtonX"],
    },
    keyboardAndMouse: "in-game",
  },
  DialogueOption2: {
    name: "Option 2",
    category: "Dialogue",
    controller: {
      type: "single",
      default: ["ButtonY"],
    },
    keyboardAndMouse: "in-game",
  },
  DialogueOption3: {
    name: "Option 3",
    category: "Dialogue",
    controller: {
      type: "single",
      default: ["ButtonA"],
    },
    keyboardAndMouse: "in-game",
  },
  DialogueExit: {
    name: "Exit",
    category: "Dialogue",
    controller: {
      type: "single",
      default: ["ButtonB"],
    },
    keyboardAndMouse: "in-game",
  },
  OpenMapsShardsInventory: {
    name: "Open Previous",
    category: "Menu",
    controller: {
      type: "single",
      default: ["Select"],
    },
    keyboardAndMouse: "in-game",
  },
  OpenAreaMap: {
    name: "Open Map",
    category: "Menu",
    controller: {
      type: "single",
      default: [],
    },
    keyboardAndMouse: "in-game",
  },
  OpenInventory: {
    name: "Open Inventory",
    category: "Menu",
    controller: {
      type: "single",
      default: [],
    },
    keyboardAndMouse: "in-game",
  },
  OpenWorldMap: {
    name: "Open World Overview",
    category: "Menu",
    // Not rebindable because it doesn't work
    controller: false,
    keyboardAndMouse: false,
  },
  OpenShards: {
    name: "Open Shards",
    category: "Menu",
    controller: {
      type: "single",
      default: [],
    },
    keyboardAndMouse: "in-game",
  },
  OpenWeaponWheel: {
    name: "Abilities",
    category: "Wheel",
    controller: {
      type: "single",
      default: ["LeftTrigger"],
    },
    keyboardAndMouse: "in-game",
  },
  PauseScreen: {
    name: "Pause Game",
    category: "General",
    controller: {
      type: "single",
      default: ["Start"],
    },
    keyboardAndMouse: "in-game",
  },
  LiveSignIn: {
    name: "Xbox Live Sign In",
    category: "General",
    // Not rebindable because no
    controller: false,
    keyboardAndMouse: false,
  },
  MapZoomIn: {
    name: "Zoom In",
    category: "Map",
    controller: {
      type: "single",
      default: ["RightTrigger"],
    },
    keyboardAndMouse: "in-game",
  },
  MapZoomOut: {
    name: "Zoom Out",
    category: "Map",
    controller: {
      type: "single",
      default: ["LeftTrigger"],
    },
    keyboardAndMouse: "in-game",
  },
  MenuSelect: {
    name: "Select",
    category: "Menu",
    controller: {
      type: "single",
      default: ["ButtonA"],
    },
    keyboardAndMouse: "in-game",
  },
  MenuBack: {
    name: "Back",
    category: "Menu",
    controller: {
      type: "single",
      default: ["ButtonB"],
    },
    keyboardAndMouse: "in-game",
  },
  MenuClose: {
    name: "Close",
    category: "Menu",
    controller: {
      type: "single",
      default: ["ButtonB"],
    },
    keyboardAndMouse: "in-game",
  },
  MenuDown: {
    name: "Down",
    category: "Menu",
    controller: {
      type: "single",
      default: ["DPadDown", "LeftStickDown"],
    },
    keyboardAndMouse: "in-game",
  },
  MenuUp: {
    name: "Up",
    category: "Menu",
    controller: {
      type: "single",
      default: ["DPadUp", "LeftStickDown"],
    },
    keyboardAndMouse: "in-game",
  },
  MenuLeft: {
    name: "Left",
    category: "Menu",
    controller: {
      type: "single",
      default: ["DPadLeft", "LeftStickLeft"],
    },
    keyboardAndMouse: "in-game",
  },
  MenuRight: {
    name: "Right",
    category: "Menu",
    controller: {
      type: "single",
      default: ["DPadRight", "LeftStickRight"],
    },
    keyboardAndMouse: "in-game",
  },
  MenuPageLeft: {
    name: "Page Left",
    category: "Menu",
    controller: {
      type: "single",
      default: ["LeftShoulder"],
    },
    keyboardAndMouse: "in-game",
  },
  MenuPageRight: {
    name: "Page Right",
    category: "Menu",
    controller: {
      type: "single",
      default: ["RightShoulder"],
    },
    keyboardAndMouse: "in-game",
  },
  LeaderboardCycleFilter: {
    name: "Cycle Leaderboard Filter",
    category: "General",
    controller: {
      type: "single",
      default: [],
    },
    keyboardAndMouse: "in-game",
  },
  MapFilter: {
    name: "Filter",
    category: "Map",
    controller: {
      type: "single",
      default: ["ButtonX"],
    },
    keyboardAndMouse: "in-game",
  },
  MapDetails: {
    name: "Details",
    category: "Map",
    controller: {
      type: "single",
      default: ["ButtonY"],
    },
    keyboardAndMouse: "in-game",
  },
  MapFocusOri: {
    name: "Focus Ori",
    category: "Map",
    // Not rebindable because the randomizer removes its functionality
    controller: false,
    keyboardAndMouse: false,
  },
  MapFocusObjective: {
    // Repurposed by the randomizer
    name: "Show/Hide Interactables",
    category: "Map",
    controller: {
      type: "single",
      default: ["RightStick"],
    },
    keyboardAndMouse: "in-game",
  },
  Left: {
    name: "Left",
    category: "General",
    controller: false,
    keyboardAndMouse: "in-game",
  },
  Right: {
    name: "Right",
    category: "General",
    controller: false,
    keyboardAndMouse: "in-game",
  },
  Up: {
    name: "Up",
    category: "General",
    controller: false,
    keyboardAndMouse: "in-game",
  },
  Down: {
    name: "Down",
    category: "General",
    controller: false,
    keyboardAndMouse: "in-game",
  },
  OpenRandomizerWheel: {
    name: "Randomizer",
    category: "Wheel",
    controller: {
      type: "composable",
      default: [["LeftTrigger", "RightTrigger"]],
    },
    keyboardAndMouse: {
      type: "composable",
      default: [{
        inputs: ["V"],
        exactModifiers: false,
      }],
    },
  },
  QuickBuy: {
    name: "Quick Buy",
    category: "Menu",
    controller: {
      type: "composable",
      default: [["ButtonX"]],
    },
    keyboardAndMouse: {
      type: "composable",
      default: [{
        inputs: ["Alpha1"],
        exactModifiers: false,
      }],
    },
  },
  Binding1: {
    name: "Binding 1",
    category: "Randomizer",
    controller: {
      type: "composable",
      default: [],
    },
    keyboardAndMouse: {
      type: "composable",
      default: [{
        inputs: ["LeftAlt", "Alpha1"],
        exactModifiers: false,
      }, {
        inputs: ["RightAlt", "Alpha1"],
        exactModifiers: false,
      }],
    },
  },
  Binding2: {
    name: "Binding 2",
    category: "Randomizer",
    controller: {
      type: "composable",
      default: [],
    },
    keyboardAndMouse: {
      type: "composable",
      default: [{
        inputs: ["LeftAlt", "Alpha2"],
        exactModifiers: false,
      }, {
        inputs: ["RightAlt", "Alpha2"],
        exactModifiers: false,
      }],
    },
  },
  Binding3: {
    name: "Binding 3",
    category: "Randomizer",
    controller: {
      type: "composable",
      default: [],
    },
    keyboardAndMouse: {
      type: "composable",
      default: [{
        inputs: ["LeftAlt", "Alpha3"],
        exactModifiers: false,
      }, {
        inputs: ["RightAlt", "Alpha3"],
        exactModifiers: false,
      }],
    },
  },
  Binding4: {
    name: "Binding 4",
    category: "Randomizer",
    controller: {
      type: "composable",
      default: [],
    },
    keyboardAndMouse: {
      type: "composable",
      default: [{
        inputs: ["LeftAlt", "Alpha4"],
        exactModifiers: false,
      }, {
        inputs: ["RightAlt", "Alpha4"],
        exactModifiers: false,
      }],
    },
  },
  Binding5: {
    name: "Binding 5",
    category: "Randomizer",
    controller: {
      type: "composable",
      default: [],
    },
    keyboardAndMouse: {
      type: "composable",
      default: [{
        inputs: ["LeftAlt", "Alpha5"],
        exactModifiers: false,
      }, {
        inputs: ["RightAlt", "Alpha5"],
        exactModifiers: false,
      }],
    },
  },
  ReconnectToServer: {
    name: "Server Reconnect",
    category: "Randomizer",
    controller: {
      type: "composable",
      default: [],
    },
    keyboardAndMouse: {
      type: "composable",
      default: [{
        inputs: ["F6"],
        exactModifiers: false,
      }],
    },
  },
  ReloadSeed: {
    name: "Reload Seed",
    category: "Randomizer",
    controller: {
      type: "composable",
      default: [],
    },
    keyboardAndMouse: {
      type: "composable",
      default: [{
        inputs: ["F5"],
        exactModifiers: false,
      }],
    },
  },
  ShowSeedTags: {
    name: "Show Seed Tags",
    category: "Randomizer",
    controller: {
      type: "composable",
      default: [],
    },
    keyboardAndMouse: {
      type: "composable",
      default: [{
        inputs: ["LeftAlt", "T"],
        exactModifiers: false,
      }, {
        inputs: ["RightAlt", "T"],
        exactModifiers: false,
      }],
    },
  },
  ShowRecentPickups: {
    name: "Show Recent Pickups",
    category: "Randomizer",
    controller: {
      type: "composable",
      default: [],
    },
    keyboardAndMouse: {
      type: "composable",
      default: [{
        inputs: ["LeftAlt", "R"],
        exactModifiers: false,
      }, {
        inputs: ["RightAlt", "R"],
        exactModifiers: false,
      }],
    },
  },
  ShowProgressWithHints: {
    name: "Show Progress and Hints",
    category: "Randomizer",
    controller: {
      type: "composable",
      default: [],
    },
    keyboardAndMouse: {
      type: "composable",
      default: [{
        inputs: ["LeftAlt", "P"],
        exactModifiers: false,
      }, {
        inputs: ["RightAlt", "P"],
        exactModifiers: false,
      }],
    },
  },
  ToggleCursorLock: {
    name: "Toggle Cursor Lock",
    category: "Randomizer",
    controller: {
      type: "composable",
      default: [],
    },
    keyboardAndMouse: {
      type: "composable",
      default: [{
        inputs: ["LeftAlt", "L"],
        exactModifiers: false,
      }, {
        inputs: ["RightAlt", "L"],
        exactModifiers: false,
      }],
    },
  },
  ToggleDebug: {
    name: "Toggle Debug Mode",
    category: "Randomizer",
    controller: {
      type: "composable",
      default: [],
    },
    keyboardAndMouse: {
      type: "composable",
      default: [],
    },
  },
  ToggleBingoBoardOverlay: {
    name: "Toggle Bingo Board Overlay",
    category: "Randomizer",
    controller: {
      type: "composable",
      default: [],
    },
    keyboardAndMouse: {
      type: "composable",
      default: [],
    },
  },
} as const satisfies Record<GameAction, GameActionMetadata>
