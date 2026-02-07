import {defineStore} from "pinia"

export const useDevtoolsStore = defineStore("devtools", () => {
  const devtoolsEnabled = ref(false)

  return {
    devtoolsEnabled,
  }
})
