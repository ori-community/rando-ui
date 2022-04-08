<template>
  <div class='value-indent' tabindex='0'>
    <slot name='header' />
    <div class='pl-4 value'>
      <slot />
    </div>
  </div>
</template>

<script>
  export default {
    name: 'ValueIndent',
    data: () => ({
      highlighted: false,
    }),
  }
</script>

<style lang='scss' scoped>
  .value-indent:focus {
    background-color: rgba(255, 255, 255, 0.2);
  }

  .value {
    border-left: 1px solid rgba(255, 255, 255, 0.3);
  }
</style>
