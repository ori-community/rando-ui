<template>
  <div>
    <em>{{ node.name || 'Invalid reference' }} (nullptr)</em>
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

</style>
