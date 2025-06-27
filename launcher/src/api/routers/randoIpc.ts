import {publicProcedure, router} from "../trpc"
import {RandoIPCService} from "@launcher/services/RandoIPCService"
import {observable} from "@trpc/server/observable"

export const randoIpc = router({
  isConnected: publicProcedure
    .query(async () => {
      return RandoIPCService.isConnected()
    }),
  onConnectionStateChanged: publicProcedure
    .subscription(() => {
      return observable<boolean>((emit) => {
        const onConnectionStateChanged = (connected: boolean) => emit.next(connected)
        RandoIPCService.events.on("connectionStateChanged", onConnectionStateChanged)

        return () => {
          RandoIPCService.events.off("connectionStateChanged", onConnectionStateChanged)
        }
      })
    }),
})
