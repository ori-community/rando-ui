<template>
  <span>
    <span v-if="originalTime !== null" class="pr-1">
      <v-icon size="x-small" color="warning">mdi-timer-alert-outline</v-icon>
      <v-tooltip location="bottom" activator="parent">
        The final time of this run has been altered.<br>
        The originally submitted time was {{ formatTime(originalTime) }}.
    </v-tooltip>
    </span>
    <template v-if="time !== null">
      {{ formatTime(time) }}
    </template>
    <template v-else>-</template>
  </span>
</template>

<script lang="ts" setup>

  import {formatTime} from "assets/utils/formatTime";

  withDefaults(defineProps<{
    time: number | null,
    originalTime: number | null,
  }>(), {
    time: null,
    originalTime: null,
  })

</script>

<style scoped lang="scss">

</style>
