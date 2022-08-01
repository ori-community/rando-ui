export const getJwtStorageKey = async () => {
  const settings = await window.electronApi.invoke('settings.getSettings')
  return `auth.jwt:${settings['Flags.Insecure'] ? 'http' : 'https'}://${settings['Paths.Host']}`
}
