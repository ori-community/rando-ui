<template>
  <div>
    <div class="teleporter" :class="{ active: Boolean(active) }">
      <img class="teleporter-image" src="@/assets/images/tracker/teleporter_alt.png" alt="" />
    </div>
    <div class="teleporter-name">{{ name }}</div>
  </div>
</template>

<script>
  export default {
    name: 'TeleporterView',
    props: {
      active: {
        type: Number,
        default: 0,
      },
      name: {
        type: String,
        required: true,
      },
    },
  }
</script>

<style lang="scss" scoped>
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
        filter: grayscale(0) brightness(1);
        transform: scale(1);
      }
    }

    img {
      width: 80%;
    }
  }

  .teleporter-name {
    display: flex;
    width: 100%;
    font-size: 1.5vw;
    font-weight: 400;
    align-content: center;
    justify-content: center;
  }
</style>
