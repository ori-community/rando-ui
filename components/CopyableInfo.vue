<template>
  <v-tooltip :value="showTooltip" right transition="slide-x-transition" :open-on-click="false" :open-on-hover="false" :open-on-focus="false">
    <template #activator="{on}">
      <div class="copyable-info" v-on="on" @click="copy">
        {{ value }}
      </div>
    </template>
    <span>Copied!</span>
  </v-tooltip>

</template>

<script>
  export default {
    name: 'CopyableInfo',
    props: {
      value: {
        type: [String, Number],
        required: true,
      },
    },
    data: () => ({
      showTooltip: false,
    }),
    methods: {
      copy() {
        this.showTooltip = true

        navigator.clipboard.writeText(this.value)

        setTimeout(() => {
          this.showTooltip = false
        }, 1000)
      }
    }
  }
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
