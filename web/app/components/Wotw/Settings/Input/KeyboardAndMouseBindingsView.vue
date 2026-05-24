<template>
  <v-card v-for="(binding, inputsIndex) in bindings" :key="inputsIndex" class="d-flex align-center ga-1 flex-wrap" color="blue-darken-4" flat>
    <template v-for="(input, index) in binding.inputs" :key="input">
      <div v-if="index > 0">+</div>
      <v-card class="d-inline-block px-2" color="blue-darken-4" flat>
        {{ keyboardAndMouseInputMetadata[input].displayName ?? input }}
      </v-card>
    </template>

    <v-icon v-if="binding.exactModifiers && binding.inputs.length > 0" size="x-small" class="mr-1">mdi-target</v-icon>

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
  import type {KeyboardAndMouseInputBindings} from "@shared/data/actions"
  import {keyboardAndMouseInputMetadata} from "@shared/data/input"

  withDefaults(defineProps<{
    bindings: KeyboardAndMouseInputBindings,
    canDelete?: boolean,
  }>(), {
    canDelete: true,
  })

  const emit = defineEmits<{
    delete: [number],
  }>()
</script>

<style lang="scss" scoped>

</style>
