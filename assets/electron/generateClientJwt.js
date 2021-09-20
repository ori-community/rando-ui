export const generateClientJwt = async axios => {
  const clientToken = await axios.$post('/tokens/', {
    scopes: ['multiverses.connect'],
  })
  window.electronApi.invoke('auth.setClientJwt', clientToken)
}
