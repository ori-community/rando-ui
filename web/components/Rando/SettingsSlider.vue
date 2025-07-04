<template>
  <div class="ml-8">
    <div class="ml-2">
      {{ label }}
    </div>
    <v-slider
      v-model="model"
      :min="min"
      :max="max"
      :step="step"
      show-ticks
      thumb-label
      hide-details
    >
      <template #thumb-label>
        <div class="text-white">
          {{ model }}
        </div>
      </template>
    </v-slider>
    <div v-if="!!description" class="ml-2">
      <div class="text-caption text-grey-lighten-1">{{ description }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  const model = defineModel<number>()

  defineProps<{
    label: string,
    description?: string,
    min: number,
    max: number,
    step: number,
  }>()
</script>

<style lang="scss" scoped>

</style>
