import {defineStore} from "pinia"

export const useDevtoolsStore = defineStore("devtools", () => {
  const forceDisplayPrereleaseVersions = ref(false)
  const devtoolsEnabled = ref(false)

  return {
    forceDisplayPrereleaseVersions,
    devtoolsEnabled,
  }
})
