<template>
  <div>
    <div v-for='(item, index) in value' :key='index'>
      <wotw-devtools-node-renderer :node='item' />
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Array',
    props: {
      value: {
        type: Array,
        required: true,
      }
    }
  }
</script>

<style scoped>

</style>
