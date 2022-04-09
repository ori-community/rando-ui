<template>
  <div>
    <wotw-devtools-value-indent>
      <template #header>
        Transform
      </template>

      <wotw-devtools-value-renderer-array :value='node.value' />
    </wotw-devtools-value-indent>
  </div>
</template>

<script>
  export default {
    props: {
      node: {
        type: Object,
        required: true,
      }
    }
  }
</script>

<style lang='scss' scoped>
  .small {
    font-size: 0.75em;
  }
</style>
