<template>
  <span>{{ node.name }}: {{ node.value }}</span>
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

</style>
