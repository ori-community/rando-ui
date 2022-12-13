declare global {
  interface ElectronApi {
    invoke(handler: string, ...args: any): any

    on(handler: string, callback: (event: any, ...args: any) => void): void
  }

  interface Window {
    electronApi: ElectronApi,
    __oriRandoUiElectron?: boolean,
  }
}

export {}
