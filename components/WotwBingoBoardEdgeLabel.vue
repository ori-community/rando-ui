<template>
  <div class='edge-label' @click="$emit('click')"> {{ label }}</div>
</template>

<script>
  export default {
    name: 'WotwBingoBoardEdgeLabel',
    props: {
      label: {
        type: String,
        required: true,
      },
    },
  }
</script>

<style lang='scss' scoped>
  .edge-label {
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }
</style>