<template>
  <span>{{ node.name }}: <code>{{ node.value }}</code></span>
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

<style scoped>
  code {
    font-family: Consolas, "Fira Code", monospace;
  }
</style>
