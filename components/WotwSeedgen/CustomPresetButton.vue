<template>
  <div>
    <v-tooltip bottom open-delay="300" :disabled="!(customPreset.description?.length > 0)">
      <template #activator="{ on }">
        <v-btn
          depressed
          class="text-none"
          :color="'background lighten-2'"
          v-on="on"
          @click="$emit('selected')"
        ><slot name="prepend" />{{ customPreset.name }}</v-btn
        >
      </template>
      <span class="description">{{ customPreset.description }}</span>
    </v-tooltip>
  </div>
</template>

<script>
  export default {
    name: 'CustomPresetButton',
    props: {
      customPreset: {
        type: Object,
        required: true,
      },
    },
  }
</script>

<style scoped>
  .description {
    white-space: pre;
  }
</style>
