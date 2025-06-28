import {publicProcedure, router} from "../trpc"
import {RandoIPCService} from "@launcher/services/RandoIPCService"
import {observable} from "@trpc/server/observable"

export const randoIpc = router({
  /**
   * Whether the RandoIPC service is currently connected to the
   * randomizer client.
   */
  isConnected: publicProcedure
    .query(async () => {
      return RandoIPCService.isConnected()
    }),
  /**
   * Subscribe to get the connection state of RandoIPC (connected or disconnected).
   * Will emit its current value on subscription.
   */
  connectionState: publicProcedure
    .subscription(() => {
      return observable<boolean>((emit) => {
        const onConnectionStateChanged = (connected: boolean) => emit.next(connected)
        RandoIPCService.events.on("connectionStateChanged", onConnectionStateChanged)

        emit.next(RandoIPCService.isConnected())

        return () => {
          RandoIPCService.events.off("connectionStateChanged", onConnectionStateChanged)
        }
      })
    }),
})
