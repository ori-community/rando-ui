import {publicProcedure, router} from "../trpc"
import {RandoIPCService} from "@launcher/services/RandoIPCService"
import {observable} from "@trpc/server/observable"

export const league = router({
  /**
   * Subscribe to get notified about league run submissions
   */
  onRunSubmitted: publicProcedure
    .subscription(() => {
      return observable<void>((emit) => {
        const onLeagueRunSubmitted = () => emit.next()
        RandoIPCService.events.on("leagueRunSubmitted", onLeagueRunSubmitted)

        return () => {
          RandoIPCService.events.off("leagueRunSubmitted", onLeagueRunSubmitted)
        }
      })
    }),
})
