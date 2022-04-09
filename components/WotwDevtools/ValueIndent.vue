<template>
  <div class='value-indent' tabindex='0'>
    <div>
      <v-btn x-small icon @click='expanded = !expanded'>
        <v-icon v-if='expanded'>mdi-chevron-down</v-icon>
        <v-icon v-else>mdi-chevron-right</v-icon>
      </v-btn>
      <slot name='header' />
    </div>
    <div v-show='expanded' class='pl-4 value'>
      <slot />
    </div>
  </div>
</template>

<script>
  export default {
    name: 'ValueIndent',
    data: () => ({
      highlighted: false,
      expanded: true,
    }),
  }
</script>

<style lang='scss' scoped>
  .value-indent:focus {
    background-color: rgba(255, 255, 255, 0.2);
  }

  .value {
    border-left: 1px solid rgba(255, 255, 255, 0.3);
  }
</style>
