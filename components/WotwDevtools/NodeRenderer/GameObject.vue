<template>
  <div>
    <wotw-devtools-value-indent>
      <template v-if='!!node.name' #header>{{ node.name }} (GameObject)</template>
      <template v-else #header>GameObject</template>
      <wotw-devtools-node-renderer v-for='(item, index) in node.value' :key='index' :node='item' />
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

<style scoped>

</style>
