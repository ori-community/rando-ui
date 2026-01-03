<template>
  <div class="copyable-info" @click="copy">
    {{ value }}
    <v-tooltip
      :value="showTooltip"
      activator="parent"
      location="right"
      transition="slide-x-transition"
      :open-on-click="false"
      :open-on-hover="false"
      :open-on-focus="false"
    >
      <span>Copied!</span>
    </v-tooltip>
  </div>

</template>

<script lang="ts" setup>
  const props = defineProps<{
    value: string,
  }>()

  const showTooltip = ref(false)

  const copy = (() => {
    showTooltip.value = true
    navigator.clipboard.writeText(props.value)
    setTimeout(() => {
      showTooltip.value = false
    }, 1000)
  })

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
