<template>
  <v-card variant="flat" color="surface-light" rounded>
    <v-btn
      :color="snippetActive ? 'secondary' : 'surface-light'"
      variant="flat"
      class="snippet-toggle"
      @click="toggleSnippet"
    >
      {{ snippetMetadata.name ?? snippetIdentifier }}
      <v-tooltip
        v-if="!!snippetMetadata.description"
        open-delay="500"
        max-width="350"
        activator="parent"
        location="bottom"
      >
        {{ snippetMetadata.description }}
      </v-tooltip>
    </v-btn>
    <template v-if="snippetHasConfig">
      <v-btn variant="plain" size="x-small" class="mx-1" icon @click="enableSnippetIfNotEnabled">
        <v-icon icon="mdi-tune" size="x-large" />

        <v-dialog v-model="configDialogOpen" activator="parent" max-width="600">
          <v-card :title="`Options for ${snippetMetadata.name ?? snippetIdentifier}`">
            <v-card-text>
              <wotw-seedgen-snippet-configs
                v-model:world-snippet-config="worldSnippetConfigModel"
                :snippet-identifier="snippetIdentifier"
                :configs-metadata="snippetMetadata.config"
              />
            </v-card-text>
            <div class="ma-3 d-flex justify-end">
              <v-btn prepend-icon="mdi-check" color="accent" flat @click="configDialogOpen = false">Done</v-btn>
            </div>
          </v-card>
        </v-dialog>
      </v-btn>
    </template>
  </v-card>
</template>

<script lang="ts" setup>
  import type {Metadata, HashMapStringHashMapStringString} from '@shared/types/seedgen'
  import {useVModel} from '@vueuse/core'

  const props = defineProps<{
    snippetIdentifier: string,
    snippetMetadata: Metadata,
    worldSnippets: string[],
    worldSnippetConfig: HashMapStringHashMapStringString,
  }>()

  const emits = defineEmits<{
    'update:worldSnippets': [string[]],
    'update:worldSnippetConfig': [HashMapStringHashMapStringString],
  }>()

  const configDialogOpen = ref(false)

  const worldSnippetsModel = useVModel(props, 'worldSnippets', emits)
  const worldSnippetConfigModel = useVModel(props, 'worldSnippetConfig', emits)
  const snippetHasConfig = computed(() => Object.keys(props.snippetMetadata.config).length > 0)
  const snippetActive = computed(() => worldSnippetsModel.value.includes(props.snippetIdentifier))

  function toggleSnippet() {
    const existingSnippetIndex = worldSnippetsModel.value.indexOf(props.snippetIdentifier)

    if (existingSnippetIndex === -1) {
      worldSnippetsModel.value.push(props.snippetIdentifier)
    } else {
      worldSnippetsModel.value.splice(existingSnippetIndex, 1)
    }
  }

  function enableSnippetIfNotEnabled() {
    if (!snippetActive.value) {
      toggleSnippet()
    }
  }
</script>

<style lang="scss" scoped>
  .snippet-toggle {
    text-transform: none !important;
  }
</style>
