export const useRandoIpc = () => {
  const isConnected = ref(false)
  const electronApi = useElectronApi()

  if (electronApi) {
    electronApi.randoIpc.connectionState.subscribe(undefined, {
      onData(value) {
        isConnected.value = value
      },
    })
  }

  return {isConnected}
}
