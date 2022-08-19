<template>
  <v-tooltip
    top
    :disabled='!description'
    open-delay='500'
  >
    <template #activator='{on}'>
      <v-btn
        depressed
        :color='value ? "secondary" : "background lighten-2"'
        class='text-none'
        v-on='on'
        @click='onButtonClick'
      >
        <slot />
      </v-btn>
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
      }
    },
    methods: {
      onButtonClick(event) {
        this.$emit("input", !this.value)
      },
    },
  }
</script>

<style scoped>

</style>
