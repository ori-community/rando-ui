export type ControllerInput =
  "LeftShoulder" |
  "RightShoulder" |
  "LeftTrigger" |
  "RightTrigger" |
  "Select" |
  "Start" |
  "LeftStick" |
  "RightStick" |
  "ButtonA" |
  "ButtonB" |
  "ButtonX" |
  "ButtonY" |
  "DPadLeft" |
  "DPadRight" |
  "DPadUp" |
  "DPadDown" |
  "LeftStickLeft" |
  "LeftStickRight" |
  "LeftStickUp" |
  "LeftStickDown" |
  "RightStickLeft" |
  "RightStickRight" |
  "RightStickUp" |
  "RightStickDown"

export type KeyboardAndMouseInput =
  "Backspace" |
  "Delete" |
  "Tab" |
  "Clear" |
  "Return" |
  "Pause" |
  "Escape" |
  "Space" |
  "Keypad0" |
  "Keypad1" |
  "Keypad2" |
  "Keypad3" |
  "Keypad4" |
  "Keypad5" |
  "Keypad6" |
  "Keypad7" |
  "Keypad8" |
  "Keypad9" |
  "KeypadPeriod" |
  "KeypadDivide" |
  "KeypadMultiply" |
  "KeypadMinus" |
  "KeypadPlus" |
  "KeypadEnter" |
  "KeypadEquals" |
  "UpArrow" |
  "DownArrow" |
  "RightArrow" |
  "LeftArrow" |
  "Insert" |
  "Home" |
  "End" |
  "PageUp" |
  "PageDown" |
  "F1" |
  "F2" |
  "F3" |
  "F4" |
  "F5" |
  "F6" |
  "F7" |
  "F8" |
  "F9" |
  "F10" |
  "F11" |
  "F12" |
  "F13" |
  "F14" |
  "F15" |
  "Alpha0" |
  "Alpha1" |
  "Alpha2" |
  "Alpha3" |
  "Alpha4" |
  "Alpha5" |
  "Alpha6" |
  "Alpha7" |
  "Alpha8" |
  "Alpha9" |
  "Exclaim" |
  "DoubleQuote" |
  "Hash" |
  "Dollar" |
  "Percent" |
  "Ampersand" |
  "Quote" |
  "LeftParen" |
  "RightParen" |
  "Asterisk" |
  "Plus" |
  "Comma" |
  "Minus" |
  "Period" |
  "Slash" |
  "Colon" |
  "Semicolon" |
  "Less" |
  "Equals" |
  "Greater" |
  "Question" |
  "At" |
  "LeftBracket" |
  "Backslash" |
  "RightBracket" |
  "Caret" |
  "Underscore" |
  "BackQuote" |
  "A" |
  "B" |
  "C" |
  "D" |
  "E" |
  "F" |
  "G" |
  "H" |
  "I" |
  "J" |
  "K" |
  "L" |
  "M" |
  "N" |
  "O" |
  "P" |
  "Q" |
  "R" |
  "S" |
  "T" |
  "U" |
  "V" |
  "W" |
  "X" |
  "Y" |
  "Z" |
  "LeftCurlyBracket" |
  "Pipe" |
  "RightCurlyBracket" |
  "Tilde" |
  "Numlock" |
  "CapsLock" |
  "ScrollLock" |
  "RightShift" |
  "LeftShift" |
  "RightControl" |
  "LeftControl" |
  "RightAlt" |
  "LeftAlt" |
  "LeftCommand" |
  "LeftApple" |
  "LeftWindows" |
  "RightCommand" |
  "RightApple" |
  "RightWindows" |
  "AltGr" |
  "Help" |
  "Print" |
  "SysReq" |
  "Break" |
  "Menu" |
  "Mouse0" |
  "Mouse1" |
  "Mouse2" |
  "Mouse3" |
  "Mouse4" |
  "Mouse5" |
  "Mouse6"

export type InputMetadata = {
  unityId: number,
  displayName?: string,
}

export type ControllerInputMetadata = InputMetadata & {
  webId: number,
}

export type KeyboardAndMouseInputMetadata = InputMetadata & {
  webId: String,
}

export const controllerInputMetadata: Record<ControllerInput, ControllerInputMetadata> = {
  ButtonA: {
    displayName: "Button A",
    unityId: 8,
    webId: 0,
  },
  ButtonB: {
    displayName: "Button B",
    unityId: 9,
    webId: 1,
  },
  ButtonX: {
    displayName: "Button X",
    unityId: 10,
    webId: 2,
  },
  ButtonY: {
    displayName: "Button Y",
    unityId: 11,
    webId: 3,
  },
  DPadDown: {
    displayName: "D-Pad Down",
    unityId: 15,
    webId: 13,
  },
  DPadLeft: {
    displayName: "D-Pad Left",
    unityId: 12,
    webId: 14,
  },
  DPadRight: {
    displayName: "D-Pad Right",
    unityId: 13,
    webId: 15,
  },
  DPadUp: {
    displayName: "D-Pad Up",
    unityId: 14,
    webId: 12,
  },
  LeftShoulder: {
    displayName: "Left Shoulder",
    unityId: 0,
    webId: 4,
  },
  LeftStick: {
    displayName: "Left Stick",
    unityId: 6,
    webId: 10,
  },
  LeftStickDown: {
    displayName: "Left Stick Down",
    unityId: 19,
    webId: -4,
  },
  LeftStickLeft: {
    displayName: "Left Stick Left",
    unityId: 16,
    webId: -1,
  },
  LeftStickRight: {
    displayName: "Left Stick Right",
    unityId: 17,
    webId: -1,
  },
  LeftStickUp: {
    displayName: "Left Stick Up",
    unityId: 18,
    webId: -3,
  },
  LeftTrigger: {
    displayName: "Left Trigger",
    unityId: 2,
    webId: 6,
  },
  RightShoulder: {
    displayName: "Right Shoulder",
    unityId: 1,
    webId: 5,
  },
  RightStick: {
    displayName: "Right Stick",
    unityId: 7,
    webId: 11,
  },
  RightStickDown: {
    displayName: "Right Stick Down",
    unityId: 19,
    webId: -4,
  },
  RightStickLeft: {
    displayName: "Right Stick Left",
    unityId: 20,
    webId: -5,
  },
  RightStickRight: {
    displayName: "Right Stick Right",
    unityId: 21,
    webId: -6,
  },
  RightStickUp: {
    displayName: "Right Stick Up",
    unityId: 22,
    webId: -7,
  },
  RightTrigger: {
    displayName: "Right Trigger",
    unityId: 3,
    webId: 7,
  },
  Select: {
    displayName: "Select",
    unityId: 4,
    webId: 8,
  },
  Start: {
    displayName: "Start",
    unityId: 5,
    webId: 9,
  },
}

export const controllerInputsByUnityId: Map<number, ControllerInput> = new Map<number, ControllerInput>(
  Object.entries(controllerInputMetadata).map(([key, input]) => [input.unityId, key as ControllerInput]),
)

export const controllerInputsByWebId: Map<number, ControllerInput> = new Map<number, ControllerInput>(
  Object.entries(controllerInputMetadata).map(([key, input]) => [input.webId, key as ControllerInput]),
)

export const keyboardAndMouseInputMetadata = {
  Backspace: {
    unityId: 8,
    webId: "Backspace",
  },
  Delete: {
    unityId: 127,
    webId: "Delete",
  },
  Tab: {
    unityId: 9,
    webId: "Tab",
  },
  Clear: {
    unityId: 12,
    webId: "Clear",
  },
  Return: {
    unityId: 13,
    webId: "Enter",
  },
  Pause: {
    unityId: 19,
    webId: "Pause",
  },
  Escape: {
    unityId: 27,
    webId: "Escape",
  },
  Space: {
    unityId: 32,
    webId: "Space",
  },
  Keypad0: {
    displayName: "Numpad 0",
    unityId: 256,
    webId: "Numpad0",
  },
  Keypad1: {
    displayName: "Numpad 1",
    unityId: 257,
    webId: "Numpad1",
  },
  Keypad2: {
    displayName: "Numpad 2",
    unityId: 258,
    webId: "Numpad2",
  },
  Keypad3: {
    displayName: "Numpad 3",
    unityId: 259,
    webId: "Numpad3",
  },
  Keypad4: {
    displayName: "Numpad 4",
    unityId: 260,
    webId: "Numpad4",
  },
  Keypad5: {
    displayName: "Numpad 5",
    unityId: 261,
    webId: "Numpad5",
  },
  Keypad6: {
    displayName: "Numpad 6",
    unityId: 262,
    webId: "Numpad6",
  },
  Keypad7: {
    displayName: "Numpad 7",
    unityId: 263,
    webId: "Numpad7",
  },
  Keypad8: {
    displayName: "Numpad 8",
    unityId: 264,
    webId: "Numpad8",
  },
  Keypad9: {
    displayName: "Numpad 9",
    unityId: 265,
    webId: "Numpad9",
  },
  KeypadPeriod: {
    unityId: 266,
    webId: "NumpadDecimal",
  },
  KeypadDivide: {
    unityId: 267,
    webId: "NumpadDivide",
  },
  KeypadMultiply: {
    unityId: 268,
    webId: "NumpadMultiply",
  },
  KeypadMinus: {
    unityId: 269,
    webId: "NumpadSubtract",
  },
  KeypadPlus: {
    unityId: 270,
    webId: "NumpadAdd",
  },
  KeypadEnter: {
    unityId: 271,
    webId: "NumpadEnter",
  },
  KeypadEquals: {
    unityId: 272,
    webId: "NumpadEquals",
  },
  UpArrow: {
    unityId: 273,
    webId: "ArrowUp",
  },
  DownArrow: {
    unityId: 274,
    webId: "ArrowDown",
  },
  RightArrow: {
    unityId: 275,
    webId: "ArrowRight",
  },
  LeftArrow: {
    unityId: 276,
    webId: "ArrowLeft",
  },
  Insert: {
    unityId: 277,
    webId: "Insert",
  },
  Home: {
    unityId: 278,
    webId: "Home",
  },
  End: {
    unityId: 279,
    webId: "End",
  },
  PageUp: {
    unityId: 280,
    webId: "PageUp",
  },
  PageDown: {
    unityId: 281,
    webId: "PageDown",
  },
  F1: {
    unityId: 282,
    webId: "F1",
  },
  F2: {
    unityId: 283,
    webId: "F2",
  },
  F3: {
    unityId: 284,
    webId: "F3",
  },
  F4: {
    unityId: 285,
    webId: "F4",
  },
  F5: {
    unityId: 286,
    webId: "F5",
  },
  F6: {
    unityId: 287,
    webId: "F6",
  },
  F7: {
    unityId: 288,
    webId: "F7",
  },
  F8: {
    unityId: 289,
    webId: "F8",
  },
  F9: {
    unityId: 290,
    webId: "F9",
  },
  F10: {
    unityId: 291,
    webId: "F10",
  },
  F11: {
    unityId: 292,
    webId: "F11",
  },
  F12: {
    unityId: 293,
    webId: "F12",
  },
  F13: {
    unityId: 294,
    webId: "F13",
  },
  F14: {
    unityId: 295,
    webId: "F14",
  },
  F15: {
    unityId: 296,
    webId: "F15",
  },
  Alpha0: {
    displayName: "0",
    unityId: 48,
    webId: "Digit0",
  },
  Alpha1: {
    displayName: "1",
    unityId: 49,
    webId: "Digit1",
  },
  Alpha2: {
    displayName: "2",
    unityId: 50,
    webId: "Digit2",
  },
  Alpha3: {
    displayName: "3",
    unityId: 51,
    webId: "Digit3",
  },
  Alpha4: {
    displayName: "4",
    unityId: 52,
    webId: "Digit4",
  },
  Alpha5: {
    displayName: "5",
    unityId: 53,
    webId: "Digit5",
  },
  Alpha6: {
    displayName: "6",
    unityId: 54,
    webId: "Digit6",
  },
  Alpha7: {
    displayName: "7",
    unityId: 55,
    webId: "Digit7",
  },
  Alpha8: {
    displayName: "8",
    unityId: 56,
    webId: "Digit8",
  },
  Alpha9: {
    displayName: "9",
    unityId: 57,
    webId: "Digit9",
  },
  Exclaim: {
    unityId: 33,
    webId: "Exclaim",
  },
  DoubleQuote: {
    unityId: 34,
    webId: "DoubleQuote",
  },
  Hash: {
    unityId: 35,
    webId: "Hash",
  },
  Dollar: {
    unityId: 36,
    webId: "Dollar",
  },
  Percent: {
    unityId: 37,
    webId: "Percent",
  },
  Ampersand: {
    unityId: 38,
    webId: "Ampersand",
  },
  Quote: {
    unityId: 39,
    webId: "Quote",
  },
  LeftParen: {
    unityId: 40,
    webId: "LeftParen",
  },
  RightParen: {
    unityId: 41,
    webId: "RightParen",
  },
  Asterisk: {
    unityId: 42,
    webId: "Asterisk",
  },
  Plus: {
    unityId: 43,
    webId: "Plus",
  },
  Comma: {
    unityId: 44,
    webId: "Comma",
  },
  Minus: {
    unityId: 45,
    webId: "Minus",
  },
  Period: {
    unityId: 46,
    webId: "Period",
  },
  Slash: {
    unityId: 47,
    webId: "Slash",
  },
  Colon: {
    unityId: 58,
    webId: "Colon",
  },
  Semicolon: {
    unityId: 59,
    webId: "Semicolon",
  },
  Less: {
    unityId: 60,
    webId: "Less",
  },
  Equals: {
    unityId: 61,
    webId: "Equals",
  },
  Greater: {
    unityId: 62,
    webId: "Greater",
  },
  Question: {
    unityId: 63,
    webId: "Question",
  },
  At: {
    unityId: 64,
    webId: "At",
  },
  LeftBracket: {
    unityId: 91,
    webId: "BracketLeft",
  },
  Backslash: {
    unityId: 92,
    webId: "Backslash",
  },
  RightBracket: {
    unityId: 93,
    webId: "BracketRight",
  },
  Caret: {
    unityId: 94,
    webId: "Caret",
  },
  Underscore: {
    unityId: 95,
    webId: "Underscore",
  },
  BackQuote: {
    unityId: 96,
    webId: "BackQuote",
  },
  A: {
    unityId: 97,
    webId: "KeyA",
  },
  B: {
    unityId: 98,
    webId: "KeyB",
  },
  C: {
    unityId: 99,
    webId: "KeyC",
  },
  D: {
    unityId: 100,
    webId: "KeyD",
  },
  E: {
    unityId: 101,
    webId: "KeyE",
  },
  F: {
    unityId: 102,
    webId: "KeyF",
  },
  G: {
    unityId: 103,
    webId: "KeyG",
  },
  H: {
    unityId: 104,
    webId: "KeyH",
  },
  I: {
    unityId: 105,
    webId: "KeyI",
  },
  J: {
    unityId: 106,
    webId: "KeyJ",
  },
  K: {
    unityId: 107,
    webId: "KeyK",
  },
  L: {
    unityId: 108,
    webId: "KeyL",
  },
  M: {
    unityId: 109,
    webId: "KeyM",
  },
  N: {
    unityId: 110,
    webId: "KeyN",
  },
  O: {
    unityId: 111,
    webId: "KeyO",
  },
  P: {
    unityId: 112,
    webId: "KeyP",
  },
  Q: {
    unityId: 113,
    webId: "KeyQ",
  },
  R: {
    unityId: 114,
    webId: "KeyR",
  },
  S: {
    unityId: 115,
    webId: "KeyS",
  },
  T: {
    unityId: 116,
    webId: "KeyT",
  },
  U: {
    unityId: 117,
    webId: "KeyU",
  },
  V: {
    unityId: 118,
    webId: "KeyV",
  },
  W: {
    unityId: 119,
    webId: "KeyW",
  },
  X: {
    unityId: 120,
    webId: "KeyX",
  },
  Y: {
    unityId: 121,
    webId: "KeyY",
  },
  Z: {
    unityId: 122,
    webId: "KeyZ",
  },
  LeftCurlyBracket: {
    unityId: 123,
    webId: "LeftCurlyBracket",
  },
  Pipe: {
    unityId: 124,
    webId: "Pipe",
  },
  RightCurlyBracket: {
    unityId: 125,
    webId: "RightCurlyBracket",
  },
  Tilde: {
    unityId: 126,
    webId: "Tilde",
  },
  Numlock: {
    unityId: 300,
    webId: "NumLock",
  },
  CapsLock: {
    unityId: 301,
    webId: "CapsLock",
  },
  ScrollLock: {
    unityId: 302,
    webId: "ScrollLock",
  },
  RightShift: {
    unityId: 303,
    webId: "ShiftRight",
  },
  LeftShift: {
    unityId: 304,
    webId: "ShiftLeft",
  },
  RightControl: {
    unityId: 305,
    webId: "ControlRight",
  },
  LeftControl: {
    unityId: 306,
    webId: "ControlLeft",
  },
  RightAlt: {
    unityId: 307,
    webId: "AltRight",
  },
  LeftAlt: {
    unityId: 308,
    webId: "AltLeft",
  },
  LeftCommand: {
    unityId: 310,
    webId: "OSLeft",
  },
  LeftApple: {
    unityId: 310,
    webId: "OSLeft",
  },
  LeftWindows: {
    unityId: 311,
    webId: "OSLeft",
  },
  RightCommand: {
    unityId: 309,
    webId: "OSRight",
  },
  RightApple: {
    unityId: 309,
    webId: "OSRight",
  },
  RightWindows: {
    unityId: 312,
    webId: "OSRight",
  },
  AltGr: {
    unityId: 313,
    webId: "AltRight",
  },
  Help: {
    unityId: 315,
    webId: "Help",
  },
  Print: {
    unityId: 316,
    webId: "PrintScreen",
  },
  SysReq: {
    unityId: 317,
    webId: "SysReq",
  },
  Break: {
    unityId: 318,
    webId: "Break",
  },
  Menu: {
    unityId: 319,
    webId: "Menu",
  },
  Mouse0: {
    displayName: "Left Mouse",
    unityId: 323,
    webId: "Mouse0",
  },
  Mouse1: {
    displayName: "Right Mouse",
    unityId: 324,
    webId: "Mouse2",
  },
  Mouse2: {
    displayName: "Middle Mouse",
    unityId: 325,
    webId: "Mouse1",
  },
  Mouse3: {
    unityId: 326,
    webId: "Mouse3",
  },
  Mouse4: {
    unityId: 327,
    webId: "Mouse4",
  },
  Mouse5: {
    unityId: 328,
    webId: "Mouse5",
  },
  Mouse6: {
    unityId: 329,
    webId: "Mouse6",
  },
} as const satisfies Record<KeyboardAndMouseInput, KeyboardAndMouseInputMetadata>

export const keyboardAndMouseInputsByUnityId: Map<number, KeyboardAndMouseInput> = new Map<number, KeyboardAndMouseInput>(
  Object.entries(keyboardAndMouseInputMetadata).map(([key, input]) => [input.unityId, key as KeyboardAndMouseInput]),
)

export const keyboardAndMouseInputsByWebId: Map<string, KeyboardAndMouseInput> = new Map<string, KeyboardAndMouseInput>(
  Object.entries(keyboardAndMouseInputMetadata).map(([key, input]) => [input.webId, key as KeyboardAndMouseInput]),
)
