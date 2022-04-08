<template>
  <div>
    <div v-if='node.value === null'>{{ node.type }} <small class='semi-transparent'>(no value)</small></div>
    <wotw-devtools-node-renderer-scalar v-else-if='node.type === "scalar"' :node='node' />
    <wotw-devtools-node-renderer-game-object v-else-if='node.type === "UnityEngine.GameObject"' :node='node' />
    <wotw-devtools-node-renderer-components v-else-if='node.type === "components"' :node='node' />
    <wotw-devtools-node-renderer-transform v-else-if='node.type === "UnityEngine.Transform"' :node='node' />
    <wotw-devtools-node-renderer-nullptr v-else-if='node.type === "nullptr"' :node='node' />
    <div v-else class='d-flex'>
      <div>{{ node.type }}</div>
      <wotw-devtools-value-renderer-json class='pl-2' :value='node.value' />
    </div>
  </div>
</template>

<script>
  export default {
    name: 'NodeRenderer',
    props: {
      node: {
        type: Object,
        required: true,
      },
    }
  }
</script>

<style lang='scss' scoped>
  .semi-transparent {
    opacity: 0.5;
  }
</style>
