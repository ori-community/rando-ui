<template>
  <div class='d-flex singlestat-view'>
    <v-progress-circular v-if='progress !== null' :size='progressSize' width='3' :value='progress * 100' class='completion-view' rotate='-90' />
    <div class='singlestat'>
      <div class='text'>{{ text }}<slot /></div>
      <div class='label'>{{ label }}</div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'WotwStatsSinglestatView',
    props: {
      text: {
        type: [String, Number],
        required: false,
        default: '',
      },
      label: {
        type: String,
        required: true,
      },
      progress: {
        type: Number,
        required: false,
        default: null,
      },
      progressSize: {
        type: Number,
        required: false,
        default: 24,
      },
    },
  }
</script>

<style lang='scss' scoped>
  .singlestat-view {
    gap: 0.5em;

    .singlestat {
      line-height: 1.1;

      .text {
        font-size: 1.3em;
      }

      .label {
        font-size: 0.9em;
        opacity: 0.6;
      }
    }
  }
</style>
