import {defineStore} from "pinia"

type QueuedMessage = {
  text: string,
  title?: string,
  prependIcon?: string,
  contentClass?: string,
  color?: string,
  timer?: string,
  timerColor?: string,
  timeout?: number,
}

export const useSnackbarStore = defineStore("snackbar", () => {
  const queue = ref<QueuedMessage[]>([])

  function add(message: QueuedMessage) {
    queue.value.push(message)
  }

  return {queue, add}
})
