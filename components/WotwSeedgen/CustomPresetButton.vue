<template>
  <div>
    <v-tooltip bottom open-delay="300" :disabled="!(customPreset.description?.length > 0)">
      <template #activator='{ on }'>
        <v-btn  v-on="on" class= 'text-none' :color="'background lighten-2'" @contextmenu='$emit("contextmenu", $event)' @click='$emit("selected")'>{{ customPreset.name }}</v-btn>
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