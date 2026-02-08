import {publicProcedure, router} from "../trpc"
import {RandoIPCService} from "@launcher/services/RandoIPCService"
import {observable} from "@trpc/server/observable"
import {z} from "zod"

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

  /**
   * Fetch the children of a game object in the hierarchy
   */
  getGameObjectChildren: publicProcedure
    .input(z.object({
      path: z.string(),
      instanceId: z.number().nullable(),
    }))
    .query(async ({input}) => {
      return RandoIPCService.getGameObjectChildren(input.path, input.instanceId)
    }),

  /**
   * Fetch a game object in the hierarchy
   */
  getGameObject: publicProcedure
    .input(z.object({
      path: z.string(),
      instanceId: z.number(),
    }))
    .query(async ({input}) => {
      return RandoIPCService.getGameObject(input.path, input.instanceId)
    }),

  setGameObjectActive: publicProcedure
    .input(z.object({
      path: z.string(),
      instanceId: z.number(),
      active: z.boolean(),
    }))
    .query(async ({input}) => {
      return await RandoIPCService.emit("set_game_object_active", {
        path: input.path,
        instance_id: input.instanceId,
        value: input.active,
      })
    }),
})
