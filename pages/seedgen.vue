<template>
  <v-container>
    <h1 class='text-center mt-12 mb-6'>Seed Generator</h1>

    <wotw-seedgen />
  </v-container>
</template>

<script>
  export default {
    head() {
      return {
        title: 'Seed Generator',
      }
    },
  }
</script>
