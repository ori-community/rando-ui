export type SeedgenLibrary = {
  apiVersion: string,
  name: string,
  description: string,
  version: string,
  worldPresets: {
    [id: string]: any,
  },
  headers: {
    [id: string]: {
      content: string,
      name: string,
    },
  },
}
