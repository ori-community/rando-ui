<template>
  <v-container>
    <h1 class='text-center mt-12 mb-6'>Seed Generator</h1>

    <v-scroll-y-transition>
      <wotw-seedgen v-show='loaded' @loaded='loaded = true' />
    </v-scroll-y-transition>
  </v-container>
</template>

<script>
  export default {
    data: () => ({
      loaded: false,
    }),
    head() {
      return {
        title: 'Seed Generator',
      }
    },
  }
</script>
