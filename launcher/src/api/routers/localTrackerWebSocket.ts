import {publicProcedure, router} from "@launcher/api/trpc"
import {observable} from "@trpc/server/observable"
import {LocalTrackerWebSocketService} from "@launcher/services/LocalTrackerWebSocketService"
import {z} from "zod"

export const localTrackerWebSocket = router({
  /**
   * Returns whether the Local Tracker WebSocket is running
   */
  isRunning: publicProcedure
    .query(async () => {
      return LocalTrackerWebSocketService.isRunning
    }),
  /**
   * Returns the port used by the Local Tracker WebSocket
   */
  getPort: publicProcedure
    .query(async () => {
      return LocalTrackerWebSocketService.port
    }),
  /**
   * Returns the endpoint ID of the Local Tracker WebSocket
   */
  getEndpointId: publicProcedure
    .query(async () => {
      return LocalTrackerWebSocketService.remoteTrackerEndpointId
    }),
  /**
   * Expose a proxy connection to the Local Tracker WebSocket
   * aka. Remote Tracker.
   */
  expose: publicProcedure
    .input(z.object({
      baseUrl: z.string(),
      jwt: z.string(),
    }))
    .query(async ({input}) => {
      return await LocalTrackerWebSocketService.expose(input.baseUrl, input.jwt)
    }),
  /**
   * Subscribe to get the server state (connected or disconnected) of
   * the Local Tracker WebSocket.
   * Will emit its current value on subscription.
   */
  serverState: publicProcedure
    .subscription(() => {
      return observable<boolean>((emit) => {
        const onServerStateChanged = (connected: boolean) => emit.next(connected)
        LocalTrackerWebSocketService.events.on("serverStateChanged", onServerStateChanged)

        emit.next(LocalTrackerWebSocketService.isRunning)

        return () => {
          LocalTrackerWebSocketService.events.off("serverStateChanged", onServerStateChanged)
        }
      })
    }),
})
