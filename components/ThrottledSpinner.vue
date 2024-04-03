<template>
  <v-fade-transition mode='out-in'>
    <div v-if='!!$slots.default' key='content'>
      <slot />
    </div>
    <div v-else-if="show" key='progress' class='text-center' :class="{'ma-8': !noMargin}">
      <v-progress-circular indeterminate v-bind="$attrs" />
    </div>
  </v-fade-transition>
</template>

<script>
  export default {
    name: 'ThrottledSpinner',
    props: {
      noMargin: {
        type: Boolean,
        default: false,
      },
    },
    data: () => ({
      show: false
    }),
    mounted() {
      setTimeout(() => {this.show = true}, 750)
    }
  }
</script>
