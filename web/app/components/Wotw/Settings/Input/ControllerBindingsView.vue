<template>
  <v-card v-for="(inputs, inputsIndex) in inputsToDisplay" :key="inputsIndex" flat class="d-flex align-center ga-1 flex-wrap" color="green-darken-4">
    <template v-for="(input, index) in inputs" :key="input">
      <div v-if="index > 0">+</div>
      <v-card class="d-inline-block px-2" color="green-darken-4" flat>
        {{ controllerInputMetadata[input]?.displayName ?? input }}
      </v-card>
    </template>

    <v-menu v-if="canDelete" activator="parent" open-on-hover offset="4">
      <v-list>
        <v-list-item @click="emit('delete', inputsIndex)">
          <v-icon start>mdi-delete</v-icon>
          Remove
        </v-list-item>
      </v-list>
    </v-menu>
  </v-card>
</template>

<script lang="ts" setup>
  import type {ControllerInputBindings, KeyboardAndMouseInputBindings} from "@shared/data/actions"
  import {controllerInputMetadata} from "@shared/data/input"

  const props = withDefaults(defineProps<{
    bindings: ControllerInputBindings,
    canDelete?: boolean,
  }>(), {
    canDelete: true,
  })

  const emit = defineEmits<{
    delete: [number],
  }>()

  const inputsToDisplay = computed(() => props.bindings.map(binding => Array.isArray(binding) ? binding : [binding]))
</script>

<style lang="scss" scoped>

</style>
