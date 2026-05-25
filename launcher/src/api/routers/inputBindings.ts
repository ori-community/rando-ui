import {publicProcedure, router} from "@launcher/api/trpc"
import {SettingsService} from "@launcher/services/SettingsService"
import {Setting, SettingKey, Settings} from "@shared/types/settings"
import {z} from "zod"
import {observable} from "@trpc/server/observable"
import {InputBindingsService} from "@launcher/services/InputBindingsService"
import {
  ControllerBindings,
  ControllerInputBindings,
  ControllerRebindableAction, KeyboardAndMouseBindings,
  KeyboardAndMouseInputBindings,
  KeyboardAndMouseRebindableAction,
} from "@shared/data/actions"

export const inputBindings = router({
  /**
   * Set controller binds for `action` to `bindings`
   */
  setControllerActionBindings: publicProcedure
    .input(z.object({
      action: z.custom<ControllerRebindableAction>(),
      bindings: z.custom<ControllerInputBindings>(),
    }))
    .query(async ({input}) => {
      await InputBindingsService.setControllerActionBindings(input.action, input.bindings)
    }),
  /**
   * Set KBM binds for `action` to `bindings`
   */
  setKeyboardAndMouseActionBindings: publicProcedure
    .input(z.object({
      action: z.custom<KeyboardAndMouseRebindableAction>(),
      bindings: z.custom<KeyboardAndMouseInputBindings>(),
    }))
    .query(async ({input}) => {
      await InputBindingsService.setKeyboardAndMouseActionBindings(input.action, input.bindings)
    }),
  /**
   * Reset all bindings to the default values
   */
  resetAllBindings: publicProcedure
    .query(async () => {
      await Promise.all([
        InputBindingsService.resetControllerBindings(),
        InputBindingsService.resetKeyboardAndMouseBindings(),
      ])
    }),
  /**
   * Subscribe to get the current controller bindings.
   * Will emit its current value on subscription.
   */
  controllerBindings: publicProcedure
    .subscription(() => {
      return observable<ControllerBindings>((emit) => {
        const onControllerBindingsChanged = (value: ControllerBindings) => emit.next(value)
        InputBindingsService.events.on("controllerBindingsChanged", onControllerBindingsChanged)

        InputBindingsService.getControllerBindings().then(emit.next)

        return () => {
          InputBindingsService.events.off("controllerBindingsChanged", onControllerBindingsChanged)
        }
      })
    }),
  /**
   * Subscribe to get the current keyboard and mouse bindings.
   * Will emit its current value on subscription.
   */
  keyboardAndMouseBindings: publicProcedure
    .subscription(() => {
      return observable<KeyboardAndMouseBindings>((emit) => {
        const onKeyboardAndMouseBindingsChanged = (value: KeyboardAndMouseBindings) => emit.next(value)
        InputBindingsService.events.on("keyboardAndMouseBindingsChanged", onKeyboardAndMouseBindingsChanged)

        InputBindingsService.getKeyboardAndMouseBindings().then(emit.next)

        return () => {
          InputBindingsService.events.off("keyboardAndMouseBindingsChanged", onKeyboardAndMouseBindingsChanged)
        }
      })
    }),
})
