import { publicProcedure, router } from '../trpc'
import { observable } from '@trpc/server/observable'
import { EventEmitter } from 'events'

export const events = new EventEmitter()

export default router({
  onTick: publicProcedure
    .subscription(() => {
      return observable<number>((emit) => {
        const onEvent = (now: number) => {
          emit.next(now)
        }

        events.on('tick', onEvent)

        return () => {
          events.off('tick', onEvent)
        }
      })
    }),
})
