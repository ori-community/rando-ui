<template>
  <v-container>
    Hi bitte Injector.exe doppelklick und so warnungen ignorieren have fun!

    <v-text-field v-model="id" label="m ID" />
    <h2>Multiverse 1</h2>
    <div>{{ multiverse1 }}</div>

    <h2>Multiverse 2</h2>
    <div>{{ multiverse2 }}</div>
  </v-container>
</template>

<script lang="ts" setup>
  const id = ref("3453")
  const idAsNumber = computed(() => {
    return Number(id.value)
  })

  const multiverse1 = await useMultiverse(idAsNumber)
  const multiverse2 = await useMultiverse(idAsNumber)
</script>

<style lang="scss" scoped>

</style>
