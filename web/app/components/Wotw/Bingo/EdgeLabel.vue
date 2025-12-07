<template>
  <div class='edge-label' @click="emit('click')"> {{ label }}</div>
</template>

<script lang="ts" setup>

  defineProps<{
    label: string,
  }>()

  const emit = defineEmits(["click"])

</script>

<style lang="scss" scoped>
  .edge-label {
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }
</style>
