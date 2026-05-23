<template>
  <v-card v-for="(binding, inputsIndex) in bindings" :key="inputsIndex" variant="tonal" class="d-flex align-center ga-1 flex-wrap" color="blue">
    <template v-for="(input, index) in binding.inputs" :key="input">
      <div v-if="index > 0">+</div>
      <v-card class="d-inline-block px-2" color="blue-darken-4" flat>
        {{ keyboardAndMouseInputMetadata[input].displayName ?? input }}
      </v-card>
    </template>
  </v-card>
</template>

<script lang="ts" setup>
  import type {KeyboardAndMouseInputBindings} from "@shared/data/actions"
  import {keyboardAndMouseInputMetadata} from "@shared/data/input"

  const props = defineProps<{
    bindings: KeyboardAndMouseInputBindings
  }>()
</script>

<style lang="scss" scoped>

</style>
