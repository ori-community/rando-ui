import {defineStore} from "pinia"
import type {SnackbarQueueMessage} from "vuetify"

// @ts-expect-error TypeScript doesn't resolve recursive types
export const useSnackbarStore = defineStore("snackbar", () => {
  // @ts-expect-error TypeScript doesn't resolve recursive types
  const queue = ref<SnackbarQueueMessage[]>([])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function add(message: any | SnackbarQueueMessage) {
    queue.value.push(message)
  }

  return {queue, add}
})
