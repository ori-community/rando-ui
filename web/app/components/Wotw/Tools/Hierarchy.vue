<template>
  <div class="mt-2">
    <template v-if="!randoIpcIsConnected">Randomizer IPC not connected</template>
    <template v-else-if="hierarchy">
      <div class="mb-1">
        <div class="d-flex align-end mb-1">
          <v-text-field
            v-model="search"
            label="Search"
            variant="solo"
            hide-details
            clearable
            prepend-inner-icon="mdi-magnify"
          />
          <v-btn :loading="isLoading" variant="text" class="ml-4" @click="reload">
            <v-icon>mdi-reload</v-icon>
          </v-btn>
        </div>
        <v-checkbox-btn
          v-model="caseSensitiveSearch"
          label="Case sensitive search"
        />
      </div>
      <v-divider class="border-opacity-50"/>
      <v-treeview
        v-model:open="openGameObjects"
        v-model:active="activeGameObjects"
        activatable
        bg-color="transparent"
        color="primary"
        :custom-filter="filter"
        density="compact"
        indent-lines
        item-key="instance_id"
        item-title="name"
        :items="hierarchy"
        items-registration="props"
        :load-children="loadSubtreeForItem"
        loading-icon="mdi-loading"
        return-object
        :search="search"
      >
        <template #title="{ item }">
        <span class="tree-item" @contextmenu.prevent="onItemContextMenu(item)">
          <span :class="{ disabled: !item.active }">
            {{ item.name }}
          </span>

          <v-icon
            v-if="!item.childrenLoaded"
            class="not-loaded"
            end
            color="grey-lighten-2"
            size="small">
            mdi-dots-horizontal-circle-outline
          </v-icon>
        </span>
        </template>
      </v-treeview>
    </template>
  </div>
</template>

<script lang="ts" setup>

  const electronApi = useElectronApi()
  const {isConnected: randoIpcIsConnected} = useRandoIpc()
  const isLoading = ref(false)
  const openGameObjects = ref<GameObject[]>([])
  const activeGameObjects = ref<GameObject[]>([])
  const hierarchy = ref<GameObject[] | undefined>([])
  const search = ref('')
  const caseSensitiveSearch = ref(false)

  interface GameObject {
    active: boolean,
    active_self: boolean,
    children_count: number,
    instance_id: number,
    name: string,
    path: string,
    type: string
    children: GameObject[] | undefined
    childrenLoaded: boolean
    value: string | null,
    fullValueLoaded: boolean
  }

  const activeValue = computed(() => {
    return activeItem?.value
  })
  const activeItem = computed(() => {
    return activeGameObjects.value.length > 0 ? activeGameObjects.value[0] : null
  })
  watch(() => randoIpcIsConnected.value, (newValue, oldValue) => {
    if (newValue != oldValue) {
      updateTree()
    }
  })

  onMounted(() => {
    if (randoIpcIsConnected.value) {
      updateTree()
    }
  })

  const filter = ((name: string, search: string,) => {
    return caseSensitiveSearch.value ? name.includes(search) : name.toLowerCase().includes(search.toLowerCase())
  })
  const reload = (async () => {
    await updateTree()
    if (activeItem.value) {
      await loadValueForItem(activeItem.value)
    }
  })
  const updateTree = (async () => {
    isLoading.value = true
    const tree = await getSubtree('')

    const loadSubtreeIfOpenOrBelowLevel = (async (root: GameObject, level: number) => {
      if (!root.childrenLoaded && (openGameObjects.value.some((o) => o.path === root.path) || level > 0)) {
        await loadSubtreeForItem(root)
      }

      for (const item of root.children ?? []) {
        await loadSubtreeIfOpenOrBelowLevel(item, level - 1)
      }
    })

    if (tree) {
      for (const level of [0, 1]) {
        for (const root of tree) {
          await loadSubtreeIfOpenOrBelowLevel(root, level)
        }
      }
    }

    hierarchy.value = tree
    isLoading.value = false
  })

  const getSubtree = (async (path: string, instanceId: number | null = null): Promise<GameObject[] | undefined> => {
    return (await electronApi?.randoIpc.getGameObjectChildren.query({path, instanceId}))?.map((item): GameObject => {
      return {
        ...item,
        children: item.children_count > 0 ? [] : undefined,
        childrenLoaded: item.children_count === 0,
        value: null,
        fullValueLoaded: false,
      }
    }) ?? undefined
  })
  const loadSubtreeForItem = (async (gameObject: GameObject) => {
    gameObject.children = await getSubtree(gameObject.path, gameObject.instance_id)
    gameObject.childrenLoaded = true
  })

  const loadValueForItem = (async (gameObject: GameObject) => {
    try {
      const fetchedItem = await electronApi?.randoIpc?.getGameObject.query({
        path: gameObject.path,
        instanceId: gameObject.instance_id
      })

      // for (const key of Object.keys(fetchedItem)) {
      //   gameObject[key] = fetchedItem[key]
      // }
      Object.assign(gameObject, fetchedItem)

      gameObject.fullValueLoaded = true
    } catch (e) {
      console.error(e)
    }
  })
  const onItemContextMenu = (async (gameObject: GameObject) => {
    await electronApi?.randoIpc?.setGameObjectActive.query({
      path: gameObject.path,
      instanceId: gameObject.instance_id,
      active: !gameObject.active
    })
    await loadValueForItem(gameObject)

    if (gameObject.childrenLoaded) {
      await loadSubtreeForItem(gameObject)
    }
  })
</script>

<style lang="scss" scoped>
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

  .disabled {
    opacity: 0.5;
  }
</style>
