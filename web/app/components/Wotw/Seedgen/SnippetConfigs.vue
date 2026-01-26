<template>
  <wotw-seedgen-snippet-config
    v-for="(configMetadata, configIdentifier) in configsMetadata"
    :key="configIdentifier"
    v-model:world-snippet-config="worldSnippetConfigModel"
    :snippet-identifier="snippetIdentifier"
    :config-identifier="String(configIdentifier)"
    :config-metadata="configMetadata"
  />
</template>

<script lang="ts" setup>
  import type {HashMapStringConfigValue, HashMapStringHashMapStringString} from '@shared/types/seedgen'
  import {useVModel} from '@vueuse/core'

  const props = defineProps<{
    snippetIdentifier: string,
    configsMetadata: HashMapStringConfigValue,
    worldSnippetConfig: HashMapStringHashMapStringString,
  }>()

  const emits = defineEmits<{
    'update:worldSnippetConfig': [HashMapStringHashMapStringString],
  }>()

  const worldSnippetConfigModel = useVModel(props, 'worldSnippetConfig', emits)
</script>

<style lang="scss" scoped>

</style>
