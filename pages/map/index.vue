<template>
  <div class="d-flex flex-grow-1">
    <wotw-map class="flex-grow-1 flex-shrink-1" />
  </div>
</template>

<script>
  export default {
    layout: 'default-without-footer',
    data: () => ({
      enabledOverlays: ['spawns'],
    }),
  }
</script>

<style lang="scss" scoped>
  .full-height {
    flex-grow: 1;
    flex-shrink: 1;
  }
</style>
