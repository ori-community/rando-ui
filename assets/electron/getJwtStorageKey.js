export const getJwtStorageKey = async () => {
  const settings = await window.electronApi.invoke('settings.getSettings')
  return `${settings['Paths.Host']}.${settings['Flags.Insecure'] ? 'plain' : 'secure'}`
}
