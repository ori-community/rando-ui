<template>
  <span @click='roundValues = !roundValues'>({{ round(value.x) }}, {{ round(value.y) }}, {{ round(value.z) }})</span>
</template>

<script>
  export default {
    props: {
      value: {
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
