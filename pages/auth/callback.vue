<template>
  <div class='text-center'>
    <v-progress-circular indeterminate />
  </div>
</template>

<script>
  export default {
    name: 'Callback',
    async middleware({ app, route }) {
      const authJwt = route.query.jwt

      // Exchange short lived token with a long lived one
      if (authJwt) {
        app.$axios.setToken(authJwt, 'Bearer')
        const token = await app.$axios.$post('/tokens/', {
          scopes: ['*'],
        })
        app.store.commit('auth/setJwt', token)
      }

      await app.router.replace(app.store.state.auth.redirectPath ?? {name: 'index'})
    },
  }
</script>

<style scoped>

</style>
