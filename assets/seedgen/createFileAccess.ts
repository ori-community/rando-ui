import { SeedgenLibrary } from '@/assets/seedgen/library'
import { getSeedgen } from '~/assets/lib/getSeedgen'

export const createFileAccessForLibrary = async (library: SeedgenLibrary) => {
  const Seedgen = await getSeedgen()
  return new Seedgen.JsFileAccess(
    () => '{}',
    (name: string) => JSON.stringify(library.worldPresets[name]),
    (name: string) => JSON.stringify(library.headers[name]),
  )
}
