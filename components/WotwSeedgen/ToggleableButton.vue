<template>
  <v-tooltip top :disabled="!description" open-delay="500" max-width="300">
    <template #activator="{ on }">
      <v-card elevation="0" class="d-inline-flex" color="background lighten-3" v-bind="$attrs" v-on="on">
        <v-btn depressed :color="value ? 'secondary' : 'background lighten-2'" class="text-none" @click="onButtonClick">
          <slot />
        </v-btn>
        <slot name="append" />
      </v-card>
    </template>
    <span>{{ description }}</span>
  </v-tooltip>
</template>

<script>
  export default {
    name: 'ToggleableButton',
    props: {
      description: {
        type: String,
        required: false,
        default: null,
      },
      value: {
        type: Boolean,
        required: true,
      },
    },
    methods: {
      onButtonClick(event) {
        this.$emit('input', !this.value)
      },
    },
  }
</script>

<style scoped></style>
