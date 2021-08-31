<template>
  <div class='text-center'>
    <v-progress-circular indeterminate />
  </div>
</template>

<script>
  export default {
    name: 'Callback',
    async middleware({ app }) {
      // TODO: exchange short-lived JWT to long-lived JWT

      await app.router.replace(app.store.state['auth/redirectRoute'] ?? {name: 'index'})
    },
  }
</script>

<style scoped>

</style>
