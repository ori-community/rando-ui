import {defineStore} from "pinia"
import type {SnackbarQueueMessage} from "vuetify"

export const useSnackbarStore = defineStore("snackbar", () => {
  const queue = ref<SnackbarQueueMessage[]>([])

  function add(message: SnackbarQueueMessage) {
    queue.value.push(message)
  }

  return {queue, add}
})
