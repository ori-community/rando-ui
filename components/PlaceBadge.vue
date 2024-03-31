<template>
  <div class="place-badge">
    <v-icon :size="size" :color="color">{{ icon }}</v-icon>
    <div
      class="text-container"
      :style="{
        fontSize: `${calcFontSize}px`, // Set font size using the prop value
        fontWeight: calcFontWeight,
      }"
    >
      {{ place }}
    </div>
  </div>
</template>

<script>
  export default {
    name: 'PlaceBadge',
    props: {
      place: {
        type: [String, Number],
        default: 1,
      },
      size: {
        type: Number,
        default: 64,
      },
    },
    computed: {
      icon() {
        switch (Number(this.place)) {
          case 1:
          case 2:
          case 3:
            return 'mdi-decagram'
          default:
            return 'mdi-circle'
        }
      },
      color() {
        switch (Number(this.place)) {
          case 1:
            return '#ffd200'
          case 2:
            return '#909090'
          case 3:
            return '#864b30'
          default:
            return 'background lighten-1'
        }
      },
      calcFontSize (){
        return this.size * 0.4
      },
      calcFontWeight (){
        return this.size * 14
      },
    },
  }
</script>

<style lang="scss" scoped>
  .place-badge {
    position: relative;
    display: inline-block;

    .text-container {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
</style>
