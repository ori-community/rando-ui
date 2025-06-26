import {publicProcedure, router} from "@/api/trpc"
import {observable} from "@trpc/server/observable"
import {LocalTrackerWebSocketService} from "@/services/LocalTrackerWebSocketService"
import {z} from "zod"

export const localTrackerWebSocket = router({
  isRunning: publicProcedure
    .query(async () => {
      return LocalTrackerWebSocketService.isRunning
    }),
  getPort: publicProcedure
    .query(async () => {
      return LocalTrackerWebSocketService.port
    }),
  getEndpointId: publicProcedure
    .query(async () => {
      return LocalTrackerWebSocketService.remoteTrackerEndpointId
    }),
  expose: publicProcedure
    .input(z.object({
      baseUrl: z.string(),
      jwt: z.string(),
    }))
    .query(async ({input}) => {
      return await LocalTrackerWebSocketService.expose(input.baseUrl, input.jwt)
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
