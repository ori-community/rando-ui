<template>
  <div class='pa-5'>
    <template v-if='!randoIpcConnected'>
      Randomizer IPC not connected
    </template>
    <template v-else>
      <div class='d-flex align-end mb-4'>
        <v-text-field v-model='search' label='Search' hide-details prepend-inner-icon='mdi-magnify' />
        <v-btn :loading='loading' icon class='ml-4' @click='reload'>
          <v-icon>mdi-reload</v-icon>
        </v-btn>
      </div>

      <div class='d-flex'>
        <div>
          <v-treeview
            dense
            activatable
            hoverable
            :items='tree'
            :open.sync='open'
            :load-children='loadSubtreeForItem'
            :search='search'
            :filter='filter'
            :active.sync='active'
            return-object
            loading-icon='mdi-loading'
            item-key='instance_id'
            transition
          >
            <template #label='{ item }'>
          <span class='tree-item'>
            {{ item.name }}

            <v-icon class='not-loaded' v-if='!item.childrenLoaded'>
              mdi-dots-horizontal-circle-outline
            </v-icon>
          </span>
            </template>
          </v-treeview>
        </div>
        <div class='pl-2'>
          <div class='sticky'>
            <template v-if='!activeItem'>
              <em>Select an item to inspect</em>
            </template>
            <wotw-devtools-node-renderer v-else :node='activeItem' />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
  import { mapState } from 'vuex'

  export default {
    layout: 'plain',
    data: () => ({
      tree: [],
      open: [],
      active: [],
      search: '',
      loading: false,
    }),
    head: {
      title: 'Client Devtools'
    },
    computed: {
      ...mapState('electron', ['randoIpcConnected']),
      activeValue() {
        return this.activeItem?.value
      },
      activeItem() {
        return this.active.length > 0
          ? this.active[0]
          : null
      },
    },
    watch: {
      randoIpcConnected: {
        immediate: true,
        handler(value, oldValue) {
          if (value && !oldValue) {
            this.updateTree()
          }
        },
      },
      activeItem(activeItem) {
        if (activeItem) {
          this.loadValueForItem(activeItem)
        }
      },
    },
    methods: {
      filter(item, search) {
        return item.name.toLowerCase().includes(search.toLowerCase())
      },
      async getSubtree(path, instanceId = null) {
        return (await window.electronApi.invoke('devtools.getGameObjectChildren', path, instanceId))?.map(item => {
          item.children = item.children_count > 0
            ? []
            : undefined
          item.childrenLoaded = item.children_count === 0
          item.value = null
          item.fullValueLoaded = false

          return item
        })
      },
      async reload() {
        await this.updateTree()
        if (this.activeItem) {
          await this.loadValueForItem(this.activeItem)
        }
      },
      async updateTree() {
        this.loading = true
        const tree = await this.getSubtree('')

        const loadSubtreeIfOpenOrBelowLevel = async (root, level) => {
          if (!root.childrenLoaded && (this.open.some(o => o.path === root.path) || level > 0)) {
            await this.loadSubtreeForItem(root)
          }

          for (const item of root.children ?? []) {
            await loadSubtreeIfOpenOrBelowLevel(item, level - 1)
          }
        }

        for (const level of [0, 1]) {
          for (const root of tree) {
            await loadSubtreeIfOpenOrBelowLevel(root, level)
          }
        }

        this.tree = tree
        this.loading = false
      },
      async loadSubtreeForItem(item) {
        item.children = await this.getSubtree(item.path, item.instance_id)
        item.childrenLoaded = true
      },
      async loadValueForItem(item) {
        try {
          item.value = (await window.electronApi.invoke('devtools.getGameObject', item.path, item.instance_id)).value
          item.fullValueLoaded = true
        } catch (e) {
          console.error(e)
        }
      },
    },
  }
</script>

<style lang='scss' scoped>
  .tree-item {
    cursor: pointer;

    .not-loaded {
      opacity: 0.5;
    }
  }

  .sticky {
    position: sticky;
    top: 1em;
  }
</style>
