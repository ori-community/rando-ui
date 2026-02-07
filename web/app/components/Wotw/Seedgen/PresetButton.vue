<template>
  <v-card v-if="large" class="pa-3 d-flex align-center" :color="color" :variant="variant" :disabled="disabled" @click="emit('click')">
    <div class="flex-grow-1">
      <template v-if="!!presetInfo">
        <h3>{{ presetInfo.name }}</h3>
        <p>{{ presetInfo.description }}</p>
      </template>
      <template v-else>
        {{ presetId }}
      </template>
    </div>
    <div>
      <v-icon>mdi-chevron-right</v-icon>
    </div>
  </v-card>
  <div v-else>
    <v-btn class="no-text-transform" :color="color" :variant="variant" :disabled="disabled" @click="emit('click')">
      {{ !!presetInfo ? presetInfo.name : presetId }}
    </v-btn>

    <v-tooltip v-if="!!presetInfo" location="bottom" activator="parent" max-width="300" open-delay="500">
      <span>
        {{ presetInfo.description }}
      </span>
      <template v-if="!!descriptionAppend">
        <v-divider class="my-2" />
        <span>
          {{ descriptionAppend }}
        </span>
      </template>
    </v-tooltip>
  </div>
</template>

<script lang="ts" setup>
  import type {PresetInfo} from '@shared/types/seedgen'

  const {
    presetInfo = null,
    large = false,
    selected = false,
    disabled = false,
    descriptionAppend = null
  } = defineProps<{
    presetInfo?: PresetInfo | null,
    presetId: string,
    large?: boolean,
    selected?: boolean,
    disabled?: boolean,
    descriptionAppend?: string | null,
  }>()

  const color = computed(() => {
    if (selected) {
      return disabled
        ? "primary"
        : "secondary"
    }

    return undefined
  })
  const variant = computed(() => selected ? "flat" : "tonal")

  const emit = defineEmits<{
    click: [],
  }>()
</script>

<style lang="scss" scoped>
  .no-text-transform {
    text-transform: none !important;
  }
</style>
