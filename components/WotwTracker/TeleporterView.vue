<template>
  <div class='teleporter' :class='{active: Boolean(active)}'>
    <img class='teleporter-image' src='@/assets/images/tracker/teleporter.png' alt='' />
  </div>
</template>

<script>
  export default {
    name: 'TeleporterView',
    props: {
      teleporter: {
        type: String,
        required: true,
      },
      active: {
        type: Number,
        default: 0,
      }
    },
  }
</script>

<style lang='scss' scoped>
  .teleporter {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;

    .teleporter-image {
      transform: scale(0.9);
      transition: filter 200ms, opacity 200ms, transform 200ms;
      opacity: 0.2;
      filter: grayscale(0.6);
    }

    &.active {
      .teleporter-image {
        opacity: 1;
        filter: grayscale(0) brightness(1.0);
        transform: scale(1);
      }
    }

    img {
      width: 100%;
    }
  }
</style>
