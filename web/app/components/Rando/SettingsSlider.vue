<template>
  <div :class="{'ml-8': !noMargin}">
    <div :class="{'ml-2': !noMargin}">
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
      :class="{'ml-n2': noMargin}"
    >
      <template #thumb-label>
        <div class="text-white">
          {{ model }}
        </div>
      </template>
    </v-slider>
    <div v-if="!!description" :class="{'ml-2': !noMargin}">
      <div class="text-caption text-grey-lighten-1">{{ description }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  const model = defineModel<number>()

  withDefaults(
    defineProps<{
      label: string,
      description?: string,
      min: number,
      max: number,
      step: number,
      noMargin?: boolean
    }>(), {
      description: undefined,
      noMargin: false,
    }
  )
</script>

<style lang="scss" scoped>

</style>
