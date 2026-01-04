<template>
  <rando-copy-to-clipboard v-slot="{ copyToClipboard }" :value="value" :timeout=1000>
    <div class="copyable-info" @click="copyToClipboard">
      {{ value }}
    </div>
  </rando-copy-to-clipboard>

</template>

<script lang="ts" setup>
  defineProps<{
    value: string,
  }>()
</script>

<style lang="scss" scoped>
  .copyable-info {
    cursor: pointer;
    font-size: 0.75em;
    line-height: 1;
    font-family: Consolas, "Fira Code", monospace;
    padding: 0.3em;
    border-radius: 0.2em;
    background-color: black;
    display: inline-block;
  }
</style>
