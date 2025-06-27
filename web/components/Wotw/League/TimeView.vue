<template>
  <span>
    <v-tooltip v-if="originalTime !== null" bottom>
      <template #activator="{ props: on }">
        <v-icon size="x-small" color="warning" v-on="on">mdi-timer-alert-outline</v-icon>
      </template>
      <span>
        The final time of this run has been altered.<br>
        The originally submitted time was {{ formatTime(originalTime) }}.
      </span>
    </v-tooltip>
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
