<template>
  <v-checkbox
    v-model="model"
    hide-details
    class="mb-2"
  >
    <template #label>
      <div>
        {{ label }}
        <div v-if="!!description" class="text-caption text-grey-lighten-1">{{ description }}</div>
      </div>
    </template>
  </v-checkbox>
</template>

<script lang="ts" setup>
  const model = defineModel<boolean>()
  defineProps<{
    label: string,
    description?: string,
  }>()
</script>

<style lang="scss" scoped>

</style>
