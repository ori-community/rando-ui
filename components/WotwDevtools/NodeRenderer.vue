<template>
  <div>
    <div v-if='node.value === null'>{{ node.type }} <small class='semi-transparent'>(no value)</small></div>
    <component :is='rendererComponent' v-else-if='rendererComponent !== null' :node='node' />
    <div v-else>
      <wotw-devtools-value-indent v-if='!forceJson && isArray(node.value)'>
        <template #header>
          {{ guessNodeLabel(node) }}
          <v-btn x-small outlined text @click='forceJson = true'>JSON</v-btn>
        </template>
        <div v-for='(item, index) in node.value' :key='index'>
          <wotw-devtools-node-renderer :node='item' />
        </div>
      </wotw-devtools-value-indent>
      <template v-else>
        <div class='d-inline-block'>{{ guessNodeLabel(node) }}</div>
        <wotw-devtools-value-renderer-json class='pl-2' :value='node.value' />
      </template>
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
    },
    data: () => ({
      forceJson: false,
    }),
    computed: {
      rendererComponent() {
        let targetType = this.node.type

        if (this.node.visualizer_type) {
          targetType = this.node.visualizer_type
        }

        switch (targetType) {
          case 'scalar': return 'wotw-devtools-node-renderer-scalar'
          case 'UnityEngine.GameObject': return 'wotw-devtools-node-renderer-game-object'
          case 'UnityEngine.Transform': return 'wotw-devtools-node-renderer-transform'
          case 'nullptr': return 'wotw-devtools-node-renderer-nullptr'
          case 'components': return 'wotw-devtools-node-renderer-components'
        }

        return null
      },
    },
    methods: {
      isArray: Array.isArray,
      guessNodeLabel(node) {
        if (node.type) {
          const types = [node.type]
          if (node.visualizer_type) {
            types.push(node.visualizer_type)
          }

          if (node.name) {
            return `${node.name} (${types.join(' / ')})`
          } else {
            return `${types.join(' / ')}`
          }
        } else if (node.name) {
          return `${node.name} (unknown type)`
        }

        return '(?)'
      }
    }
  }
</script>

<style lang='scss' scoped>
  .semi-transparent {
    opacity: 0.5;
  }

  .small {
    font-size: 0.75em;
  }
</style>
