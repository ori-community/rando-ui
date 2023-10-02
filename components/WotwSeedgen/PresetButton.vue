<template>
    <v-row>
      <v-btn @click='$emit("load-preset", presetName)'>{{ presetName }}
      </v-btn>
    </v-row>
</template>

<script>
  export default {
    name: 'PresetButton',
    props: {
      presetName: {
        type: String,
        required: true,
      },
    },
  }
</script>