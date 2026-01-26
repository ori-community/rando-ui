<template>
  <div>
    <template v-if="configMetadata.default.type === 'Boolean'">
      <v-checkbox v-model="booleanConfigValue" hide-details>
        <template #label>
          <div>
            <div>{{ configMetadata.name }}</div>
            <div v-if="!!configMetadata.description" class="text-caption">{{ configMetadata.description }}</div>
          </div>
        </template>
        <template #append>
          <v-btn v-if="!configIsDefault" icon="mdi-arrow-u-left-top" variant="plain" @click="resetToDefault" />
        </template>
      </v-checkbox>
    </template>
    <template v-else-if="configMetadata.default.type === 'Integer'">
      <v-number-input
        v-model="numberConfigValue"
        class="mb-2"
        :label="configMetadata.name"
        :hint="configMetadata.description ?? undefined"
        persistent-hint
        :step="1"
      >
        <template #append-inner>
          <v-btn v-if="!configIsDefault" icon="mdi-arrow-u-left-top" variant="plain" @click="resetToDefault" />
        </template>
      </v-number-input>
    </template>
    <template v-else-if="configMetadata.default.type === 'Float'">
      <v-number-input
        v-model="numberConfigValue"
        class="mb-2"
        :label="configMetadata.name"
        :hint="configMetadata.description ?? undefined"
        persistent-hint
        :step="0.01"
        :precision="null"
      >
        <template #append-inner>
          <v-btn v-if="!configIsDefault" icon="mdi-arrow-u-left-top" variant="plain" @click="resetToDefault" />
        </template>
      </v-number-input>
    </template>
  </div>
</template>

<script lang="ts" setup>
  import type {HashMapStringConfigValue, HashMapStringHashMapStringString} from '@shared/types/seedgen'
  import {useVModel} from '@vueuse/core'

  type ConfigValue = HashMapStringConfigValue[keyof HashMapStringConfigValue]

  const props = defineProps<{
    snippetIdentifier: string,
    configIdentifier: string,
    configMetadata: ConfigValue,
    worldSnippetConfig: HashMapStringHashMapStringString,
  }>()

  const emits = defineEmits<{
    'update:worldSnippetConfig': [HashMapStringHashMapStringString],
  }>()

  const worldSnippetConfigModel = useVModel(props, 'worldSnippetConfig', emits)
  const stringConfigValue = computed({
    get() {
      return worldSnippetConfigModel.value?.[props.snippetIdentifier]?.[props.configIdentifier] ?? valueToString(props.configMetadata.default.value)
    },
    set(value) {
      const isDefault = stringToConfigType(value) === props.configMetadata.default.value

      if (isDefault) {
        resetToDefault()
        return
      }

      if (worldSnippetConfigModel.value[props.snippetIdentifier] === undefined) {
        worldSnippetConfigModel.value[props.snippetIdentifier] = {}
      }

      worldSnippetConfigModel.value[props.snippetIdentifier]![props.configIdentifier] = value
    },
  })
  const configIsDefault = computed(() => {
    return stringToConfigType(stringConfigValue.value) === props.configMetadata.default.value
  })

  function valueToString(value: ConfigValue['default']['value']) {
    return String(value)
  }

  function stringToBoolean(value: string) {
    return value === 'true'
  }

  function stringToNumber(value: string) {
    return Number(value)
  }

  function stringToConfigType(value: string): ConfigValue['default']['value'] {
    switch (props.configMetadata.default.type) {
      case 'Boolean':
        return stringToBoolean(value)
      case 'Integer':
      case 'Float':
        return stringToNumber(value)
    }
  }

  function resetToDefault() {
    const snippetConfig = worldSnippetConfigModel.value[props.snippetIdentifier]

    if (snippetConfig === undefined) {
      return
    }

    // If we are setting the config value to its default value, remove the config item
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete snippetConfig[props.configIdentifier]

    if (Object.keys(snippetConfig).length === 0) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete worldSnippetConfigModel.value[props.snippetIdentifier]
    }
  }

  const booleanConfigValue = computed({
    get() {
      return stringToBoolean(stringConfigValue.value)
    },
    set(value) {
      stringConfigValue.value = valueToString(value)
    },
  })

  const numberConfigValue = computed({
    get() {
      return stringToNumber(stringConfigValue.value)
    },
    set(value) {
      stringConfigValue.value = valueToString(value)
    },
  })
</script>

<style lang="scss" scoped>

</style>
