<template>
  <v-card variant="flat" color="surface-light" rounded>
    <v-btn
      :color="color"
      variant="flat"
      class="snippet-toggle"
      :disabled="includeChains.length > 0"
      @click="toggleSnippet"
    >
      {{ snippetInfo.metadata.name ?? snippetIdentifier }}
    </v-btn>
    <template v-if="snippetHasConfig">
      <v-btn variant="plain" size="x-small" class="mx-1" icon @click="enableSnippetIfNotEnabled">
        <v-icon icon="mdi-tune" size="x-large" />
        <v-dialog v-model="configDialogOpen" activator="parent" max-width="600">
          <v-card :title="`Options for ${snippetInfo.metadata.name ?? snippetIdentifier}`">
            <v-card-text>
              <wotw-seedgen-snippet-configs
                v-model:world-snippet-config="worldSnippetConfigModel"
                :snippet-identifier="snippetIdentifier"
                :configs-metadata="snippetInfo.metadata.config"
              />
            </v-card-text>
            <div class="ma-3 d-flex justify-end">
              <v-btn prepend-icon="mdi-check" color="accent" flat @click="configDialogOpen = false">Done</v-btn>
            </div>
          </v-card>
        </v-dialog>
      </v-btn>
      <v-badge
        :model-value="snippetHasNonDefaultValues" floating color="bg-primary" offset-x="13" offset-y="-10"
        bordered dot
      />
    </template>
    <span v-if="snippetInfo.origin.dir === 'UserData'">
      <v-btn variant="plain" size="x-small" class="mx-1" icon readonly>
        <v-icon icon="mdi-account-outline" size="x-large" />
      </v-btn>
    </span>
    <v-tooltip
      content-class="bg-surface-light"
      open-delay="500"
      max-width="350"
      activator="parent"
      location="bottom"
    >
      <span>
        <template v-if="!!snippetInfo.metadata.description">
          {{ snippetInfo.metadata.description }}
        </template>
        <em v-else class="opacity-70">
          No description
        </em>
      </span>
      <template v-if="includeChains.length > 0 || isCustom">
        <v-divider class="my-2" />
        <div v-if="includeChains.length > 0" class="d-flex opacity-60">
          <v-icon start>mdi-import</v-icon>
          <div>
            <div v-for="chain in includeChains">
              Included in: {{ chain.map(element => `'${element.name ?? element.id}'`).join(" ⟶ ") }}
            </div>
          </div>
        </div>
        <div v-if="isCustom" class="opacity-60">
          <v-icon start>mdi-account-outline</v-icon>
          User preset
        </div>
      </template>
    </v-tooltip>
  </v-card>
</template>

<script lang="ts" setup>
  import type {HashMapStringHashMapStringString, SnippetInfo} from "@shared/types/seedgen"
  import {useVModel} from "@vueuse/core"
  import type {IncludeChain, ValidSnippetInfos} from "@shared/types/seedgen-extra"

  const props = withDefaults(
    defineProps<{
      snippetIdentifier: string,
      snippetInfo: SnippetInfo,
      snippetInfos: ValidSnippetInfos,
      worldSnippets: string[],
      worldSnippetConfig: HashMapStringHashMapStringString,
      includeChains?: IncludeChain[],
    }>(), {
      includeChains: () => [],
    },
  )

  const emit = defineEmits<{
    "update:worldSnippets": [string[]],
    "update:worldSnippetConfig": [HashMapStringHashMapStringString],
  }>()

  const configDialogOpen = ref(false)

  const worldSnippetsModel = useVModel(props, "worldSnippets", emit)
  const worldSnippetConfigModel = useVModel(props, "worldSnippetConfig", emit)
  const snippetHasConfig = computed(() => Object.keys(props.snippetInfo.metadata.config).length > 0)
  const snippetActive = computed(() => props.includeChains.length > 0 || worldSnippetsModel.value.includes(props.snippetIdentifier))
  const snippetHasNonDefaultValues = computed(() =>
    Object.keys(props.snippetInfo.metadata.config).some(configKey => {
      const configValue = worldSnippetConfigModel.value[props.snippetIdentifier]?.[configKey]

      if (configValue === undefined) {
        return false
      }

      return configValue !== String(props.snippetInfo.metadata.config[configKey]?.value.default)
    }),
  )
  const isCustom = computed(() => props.snippetInfo.origin.dir === 'UserData')
  const color = computed(() => {
    if (snippetActive.value) {
      return props.includeChains.length > 0
        ? "primary"
        : "secondary"
    }

    return "surface-light"
  })

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
