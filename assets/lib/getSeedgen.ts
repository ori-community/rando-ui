export async function getSeedgen() {
  const seedgen = await import('@ori-rando/wotw-seedgen-wasm-ui')
  seedgen.init_panic_hook()
  return seedgen
}
