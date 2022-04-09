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
        <wotw-devtools-value-renderer-array :value='node.value' />
      </wotw-devtools-value-indent>
      <template v-else-if='typeof node.value === "object"'>
        <div class='d-inline-block'>{{ guessNodeLabel(node) }} <v-btn v-if='rendererComponent !== null' x-small outlined text @click='forceJson = false'>Visual</v-btn></div>
        <wotw-devtools-value-renderer-json class='pl-2' :value='node.value' />
      </template>
      <template v-else>
        <wotw-devtools-node-renderer-scalar :node='node' />
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
        return this.getRendererComponentForNode(this.node)
      },
    },
    methods: {
      isArray: Array.isArray,
      getRendererComponentForNode(node) {
        let targetType = node.type

        if (node.visualizer_type) {
          targetType = node.visualizer_type
        }

        switch (targetType) {
          case 'scalar': return 'wotw-devtools-node-renderer-scalar'
          case 'UnityEngine.GameObject': return 'wotw-devtools-node-renderer-game-object'
          case 'UnityEngine.Transform': return 'wotw-devtools-node-renderer-transform'
          case 'nullptr': return 'wotw-devtools-node-renderer-nullptr'
          case 'components': return 'wotw-devtools-node-renderer-components'
          case 'vector_3': return 'wotw-devtools-node-renderer-vector3'
        }

        return null
      },
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
