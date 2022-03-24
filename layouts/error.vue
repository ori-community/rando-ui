<template>
  <v-app dark>
    <v-container>
      <h1 v-if="error.statusCode === 404">
        {{ pageNotFound }}
      </h1>
      <template v-else>
        <h1>Something went oribly wrong.</h1>
        {{ otherError }}
      </template>

      <NuxtLink to="/">
        Home page
      </NuxtLink>
    </v-container>
  </v-app>
</template>

<script>
  export default {
    layout: 'empty',
    props: {
      error: {
        type: Object,
        default: null
      }
    },
    data() {
      return {
        pageNotFound: '404 Not Found',
        otherError: 'An error occurred'
      }
    },
    head() {
      const title =
        this.error.statusCode === 404 ? this.pageNotFound : this.otherError
      return {
        title
      }
    }
  }
</script>

<style scoped>
  h1 {
    font-size: 20px;
  }
</style>
