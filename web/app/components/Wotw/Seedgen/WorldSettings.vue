<template>
  <div class="snippets-grid gap-12">
    <div v-for="category in sortedSnippetCategories" :key="category">
      <h3>{{ category }}</h3>

      <div class="snippets">
        <wotw-seedgen-snippet-toggle
          v-for="snippet in categorizedSnippetsInfo[category]"
          :key="snippet.identifier"
          v-model:world-snippets="model.snippets"
          v-model:world-snippet-config="model.snippetConfig"
          :snippet-identifier="snippet.identifier"
          :snippet-metadata="snippet.metadata"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import {useVModel} from '@vueuse/core'
  import type {HashMapStringMetadata, Metadata, WorldSettings} from '@shared/types/seedgen'

  const props = defineProps<{
    modelValue: WorldSettings,
    snippetsInfo: HashMapStringMetadata,
  }>()

  const emits = defineEmits<{
    "update:modelValue": [WorldSettings],
  }>()

  const model = useVModel(props, "modelValue", emits)

  const visibleSnippetsInfo = computed(() => Object.fromEntries(Object.entries(props.snippetsInfo).filter(([, e]) => !e.hidden)))
  const categorizedSnippetsInfo = computed(() => {
    const categories: {[categoryName: string]: {identifier: string, metadata: Metadata}[]} = {}

    for (const [identifier, metadata] of Object.entries(visibleSnippetsInfo.value)) {
      const categoryName = metadata.category ?? "Uncategorized"

      if (!Object.hasOwn(categories, categoryName)) {
        categories[categoryName] = []
      }

      categories[categoryName]?.push({
        identifier,
        metadata,
      })
    }

    return categories
  })
  const wellKnownSnippetCategories = ["Goals", "Hints", "Item Pool", "World Changes", "Placements", "Quality of Life", "Gameplay"]
  const sortedSnippetCategories = computed(() => {
    // Sort by wellKnownSnippetCategories, or alphabetically if unknown

    const categories = Object.keys(categorizedSnippetsInfo.value)

    categories.sort((a, b) => {
      const aValue = wellKnownSnippetCategories.indexOf(a)
      const bValue = wellKnownSnippetCategories.indexOf(b)

      if (aValue === -1 && bValue !== -1) {
        return 1
      }

      if (aValue !== -1 && bValue === -1) {
        return -1
      }

      if (aValue === -1 && bValue === -1) {
        return a.localeCompare(b)
      }

      return aValue - bValue
    })

    return categories
  })
</script>

<style lang="scss" scoped>
  .snippets-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));

    .snippets {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5em;
    }
  }
</style>
