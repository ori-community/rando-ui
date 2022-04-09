<template>
  <span @click='roundValues = !roundValues'>
    {{ node.name || 'Vector3' }}:
    ({{ round(node.value.x) }}, {{ round(node.value.y) }}, {{ round(node.value.z) }})
  </span>
</template>

<script>
  export default {
    props: {
      node: {
        type: Object,
        required: true,
      },
    },
    data: () => ({
      roundValues: true,
    }),
    methods: {
      round(value) {
        return this.roundValues
          ? value.toFixed(1)
          : value
      },
    }
  }
</script>

<style scoped>

</style>
