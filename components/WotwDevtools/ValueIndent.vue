<template>
  <div class='value-indent pl-4'>
    <slot />
  </div>
</template>

<script>
  export default {
    name: 'ValueIndent',
  }
</script>

<style lang='scss' scoped>
  .value-indent {
    border-left: 1px solid rgba(255, 255, 255, 0.3);
  }
</style>
