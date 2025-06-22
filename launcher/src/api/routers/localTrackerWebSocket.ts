import {publicProcedure, router} from "@/api/trpc"
import {RandoIPCService} from "@/services/RandoIPCService"
import {observable} from "@trpc/server/observable"
import {LocalTrackerWebSocketService} from "@/services/LocalTrackerWebSocketService"

export const localTrackerWebSocket = router({
  isRunning: publicProcedure
    .query(async () => {
      return LocalTrackerWebSocketService.isRunning
    }),
  onServerStateChanged: publicProcedure
    .subscription(() => {
      return observable<boolean>((emit) => {
        const onServerStateChanged = (connected: boolean) => emit.next(connected)
        LocalTrackerWebSocketService.events.on("serverStateChanged", onServerStateChanged)

        return () => {
          LocalTrackerWebSocketService.events.off("serverStateChanged", onServerStateChanged)
        }
      })
    }),
})
