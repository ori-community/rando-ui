<template>
  <div>
    <vue-json-pretty
      :data='value'
      :show-double-quotes='false'
      :deep='0'
    />
  </div>
</template>

<script>
  import 'vue-json-pretty/lib/styles.css'

  export default {
    components: {
      VueJsonPretty: () => import('vue-json-pretty'),
    },
    props: {
      value: {
        type: Object,
        required: true,
      },
    },
  }
</script>

<style lang='scss'>
  .vjs-tree__node:hover {
    background-color: rgba(255, 255, 255, 0.1)
  }
</style>
