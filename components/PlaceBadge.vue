<template>
  <div class="place-badge">
    <v-icon size="64" :color="color">{{ icon }}</v-icon>
    <div class="text-container">
      {{ place }}
    </div>
  </div>
</template>

<script>
  export default {
    name: 'PlaceBadge',
    props: {
      place: {
        type: Number,
        default: 1,
      },
    },
    computed: {
      icon() {
        switch (this.place) {
          case 1:
          case 2:
          case 3:
            return 'mdi-decagram'
          default:
            return 'mdi-circle'
        }
      },
      color() {
        switch (this.place) {
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
    }
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
      font-size: 26px;
      font-weight: 900;
    }
  }
</style>
