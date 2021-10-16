export default ({ app }) => {
  app.store.commit('auth/setJwt', window.localStorage.getItem('auth.jwt'))
  app.store.commit('auth/setRedirectPath', window.localStorage.getItem('auth.redirectPath'))
}
