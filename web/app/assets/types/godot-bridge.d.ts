type GodotBridge = {
  call: (ipcName: string, args: unknown[]) => void,
}

declare global {
  interface Window {
    __godotBridge?: GodotBridge
  }
}
