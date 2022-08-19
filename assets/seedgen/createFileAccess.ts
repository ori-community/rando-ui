import { SeedgenLibrary } from '@/assets/seedgen/library'

export const createFileAccessForLibrary = async (library: SeedgenLibrary) => {
  const Seedgen = await import('@ori-rando/wotw-seedgen-wasm-ui')
  return new Seedgen.JsFileAccess(
    () => '{}',
    (name: string) => JSON.stringify(library.worldPresets[name]),
    (name: string) => JSON.stringify(library.headers[name]),
  )
}
