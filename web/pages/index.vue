<template>
  <v-container>
    Hi bitte Injector.exe doppelklick und so warnungen ignorieren have fun!
  </v-container>
</template>

<script lang="ts" setup>
  const foo = computed(() => {
    return 'foosfd'
  })

  const myData = ref('fsjdk')

  function belbe() {
    myData.value = '"kjhfdskjhfdskdf'
  }
</script>

<style lang="scss" scoped>

</style>
