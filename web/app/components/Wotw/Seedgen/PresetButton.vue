<template>
  <v-card
    v-if="large"
    class="pa-3 d-flex align-center"
    :color="color"
    :variant="variant"
    :disabled="isDisabled"
    @click="emit('click')"
  >
    <div class="flex-grow-1">
      <div class="d-flex align-center ga-3">
        <v-icon v-if="icon !== null">{{ icon }}</v-icon>
        <div v-if="!!presetInfo">
          <h3>
            {{ presetInfo.name }}
            <v-icon v-if="isCustom" size="24">mdi-account-outline</v-icon>
          </h3>
          <p>{{ presetInfo.description }}</p>
        </div>
        <div v-else>
          <slot>{{ presetId }}</slot>
        </div>
      </div>
    </div>
    <div>
      <v-icon>mdi-chevron-right</v-icon>
    </div>
  </v-card>
  <div v-else>
    <v-btn class="no-text-transform" :color="color" :variant="variant" :disabled="isDisabled" @click="emit('click')">
      <v-icon v-if="icon !== null" start>{{ icon }}</v-icon>
      {{ !!presetInfo ? presetInfo.name : presetId }}
      <v-icon v-if="isCustom" end>mdi-account-outline</v-icon>
    </v-btn>
    <v-tooltip content-class="bg-surface-light" location="bottom" activator="parent" max-width="300" open-delay="500">
      <span>
        <template v-if="!!presetInfo?.description">
          {{ presetInfo.description }}
        </template>
        <em v-else class="opacity-70">
          No description
        </em>
      </span>
      <template v-if="includeChains.length > 0 || isCustom">
        <v-divider class="my-2" />
        <div v-if="includeChains.length > 0" class="d-flex">
          <v-icon start>mdi-import</v-icon>
          <div>
            <div v-for="chain in includeChains">
              Included in: {{ chain.map(element => `'${element.name ?? element.id}'`).join(" ⟶ ") }}
            </div>
          </div>
        </div>
        <div v-if="isCustom">
          <v-icon start>mdi-account-outline</v-icon>
          User preset
        </div>
      </template>
    </v-tooltip>
  </div>
</template>

<script lang="ts" setup>
  import type {PresetInfo} from "@shared/types/seedgen"
  import type {IncludeChain} from "@shared/types/seedgen-extra"

  const {
    presetInfo = null,
    large = false,
    selected = false,
    disabled = false,
    icon = null,
    includeChains = [],
    isCustom = false,
  } = defineProps<{
    presetInfo?: PresetInfo | null,
    presetId: string,
    large?: boolean,
    selected?: boolean,
    disabled?: boolean,
    icon?: string | null,
    includeChains?: IncludeChain[],
    isCustom?: boolean,
  }>()

  const isSelected = computed(() => selected || includeChains.length > 0)
  const isDisabled = computed(() => disabled || includeChains.length > 0)
  const color = computed(() => {
    if (isSelected.value) {
      return isDisabled.value
        ? "primary"
        : "secondary"
    }

    return undefined
  })
  const variant = computed(() => isSelected.value ? "flat" : "tonal")

  const emit = defineEmits<{
    click: [],
  }>()
</script>

<style lang="scss" scoped>
  .no-text-transform {
    text-transform: none !important;
  }
</style>
