<template>
  <v-card v-for="(inputs, inputsIndex) in inputsToDisplay" :key="inputsIndex" variant="tonal" class="d-flex align-center ga-1 flex-wrap" color="green">
    <template v-for="(input, index) in inputs" :key="input">
      <div v-if="index > 0">+</div>
      <v-card class="d-inline-block px-2" color="green-darken-4" flat>
        {{ controllerInputMetadata[input].displayName ?? input }}
      </v-card>
    </template>
  </v-card>
</template>

<script lang="ts" setup>
  import type {ControllerInputBindings} from "@shared/data/actions"
  import {controllerInputMetadata} from "@shared/data/input"

  const props = defineProps<{
    bindings: ControllerInputBindings
  }>()

  const inputsToDisplay = computed(() => props.bindings.map(binding => Array.isArray(binding) ? binding : [binding]))
</script>

<style lang="scss" scoped>

</style>
