declare namespace window {
  interface ElectronApi {
    invoke(handler: string, ...args: any): any,
    on(handler: string, callback: (event: any, ...args: any) => void): void;
  }

  const electronApi: ElectronApi
}
