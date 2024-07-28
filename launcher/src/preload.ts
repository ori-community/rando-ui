import { exposeElectronTRPC } from 'electron-trpc/main'

process.once('loaded', async () => {
  exposeElectronTRPC()
  console.log('Exposed tRPC API')
})
