<template>
  <span>
    <v-tooltip v-if="originalTime !== null" bottom>
      <template #activator="{ on }">
        <v-icon x-small color="warning" v-on="on">mdi-timer-alert-outline</v-icon>
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

<script>
  import { formatTime } from '@/assets/lib/formatTime'

  export default {
    name: 'TimeView',
    props: {
      time: {
        type: Number,
        required: false,
        default: null,
      },
      originalTime: {
        type: Number,
        required: false,
        default: null,
      },
    },
    methods: { formatTime },
  }
</script>

<style scoped lang="scss">

</style>
