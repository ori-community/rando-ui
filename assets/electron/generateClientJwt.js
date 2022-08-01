export const generateClientJwt = async axios => {
  const existingClientJwt = await window.electronApi.invoke('auth.getClientJwt')

  if (existingClientJwt) {
    try {
      await axios.$get('/tokens/test', {
        headers: {
          Authorization: `Bearer ${existingClientJwt}`,
        },
      })

      // Token is still valid, don't create a new one
      return
    } catch (e) {
      // Token is likely invalid...
    }
  }

  const clientToken = await axios.$post('/tokens/', {
    scopes: ['multiverses.connect'],
  })
  await window.electronApi.invoke('auth.setClientJwt', clientToken)
}
