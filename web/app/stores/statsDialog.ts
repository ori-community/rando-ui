import {defineStore} from "pinia"

export const useStatsDialogStore = defineStore("statsDialog", () => {
  const open = ref(false)

  return {
    open,
  }
})
