<template>
  <div class='dialog-anchor' :class='{visible: value}'>
    <div class='floating-overlay-dialog-backdrop'></div>
    <div
      class='floating-overlay-dialog pl-3 py-12'
      :style='{transform: dialogTransform}'
      @mouseenter.self='$emit("input", true)'
      @mouseleave.self='$emit("input", false)'
    >
      <v-card class='d-flex align-center'>
        <div class='pa-5 pr-8'>
          <slot />
          <v-btn class='chevron-button' icon small @click='$emit("input", !value)'>
            <v-icon class='chevron'>mdi-chevron-right</v-icon>
          </v-btn>
        </div>
      </v-card>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'FloatingOverlayDialog',
    props: {
      value: {
        type: Boolean,
        required: true,
        default: false,
      },
      hideCompletely: {
        type: Boolean,
        required: false,
        default: false,
      },
    },
    computed: {
      dialogTransform() {
        return this.value
          ? 'translateY(-50%) translateX(0%)'
          : `translateY(-50%) translateX(calc(-100% + ${this.hideCompletely ? 0 : 28}px))`
      },
    },
  }
</script>

<style lang='scss' scoped>
  $curve: cubic-bezier(.3, 1, .6, 1);

  .dialog-anchor {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
  }

  .floating-overlay-dialog-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--v-background-base);
    z-index: 1000;
    opacity: 0;
    pointer-events: none;
    transition: opacity 350ms $curve;
  }

  .floating-overlay-dialog {
    z-index: 1001;
    position: fixed;
    top: 50%;
    left: 0;
    transition: transform 350ms $curve;
    pointer-events: auto;
  }

  .chevron-button {
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(-50%);

    .chevron {
      transition: transform 350ms $curve, opacity 200ms $curve;
    }
  }

  .dialog-anchor.visible {
    .floating-overlay-dialog-backdrop {
      opacity: 0.5;
    }

    .chevron {
      transform: scaleX(-1);
      opacity: 0.5;
    }
  }
</style>
