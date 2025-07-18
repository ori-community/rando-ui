<template>
  <div class="skill" :class="{ active: acquired }">
    <img class="skill-image" :src="imageSource" alt="">

    <div class="tree" :class="{ active: treeAcquired }">
      <img src="@shared/images/tracker/tree.png" alt="">
      <img class="shadow" src="@shared/images/tracker/tree.png" alt="">
    </div>
    <div class="bonus-melting" :class="{ active: bonusMeltingAcquired }">
      <img class="glow" src="@shared/images/tracker/melting.png" alt="">
      <img src="@shared/images/tracker/melting.png" alt="">
    </div>
    <div
      v-if="fragmentsRequired > 0" class="fragments"
      :class="{ 'completed': fragmentsFound >= fragmentsRequired }">
      <span class="found">{{ fragmentsFound }}</span><span class="required">/{{ fragmentsRequired }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">

  const props = withDefaults(defineProps<{
    skill: string,
    acquired: boolean,
    treeAcquired?: boolean,
    bonusMeltingAcquired?: boolean,
    fragmentsFound?: number,
    fragmentsRequired?: number,
  }>(), {
    acquired: false,
    treeAcquired: false,
    bonusMeltingAcquired: false,
    fragmentsFound: 0,
    fragmentsRequired: 0,
  })

  // TODO test skill images on tracker
  // const imageSource = computed(() => {
  //   const url = new URL(`../../../../../shared/images/tracker/skills/${props.skill}.png`, import.meta.url)
  //   return url.href
  // })

  const images = import.meta.glob('@shared/images/tracker/skills/*.png', {eager: true})
  const imageSource = computed(() => {
    const key = `${props.skill}.png`
    const fileEntry = Object.entries(images).find(([path]) =>
      path.endsWith(key)
    )
    return (fileEntry![1] as { default: string }).default
  })


</script>

<style lang="scss" scoped>
  .skill {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;

    .skill-image {
      transform: scale(0.9);
      transition: filter 200ms, opacity 200ms, transform 200ms;
      opacity: 0.2;
      filter: grayscale(0.6);
    }

    &.active {
      .skill-image {
        opacity: 1;
        filter: grayscale(0) brightness(1);
        transform: scale(1);
      }
    }

    img {
      width: 100%;
    }

    .tree {
      z-index: 0;
      position: absolute;
      top: 62%;
      left: 66%;
      width: 35%;
      transform-origin: bottom center;
      transform: scale(0);
      transition: transform 300ms;

      &.active {
        transform: scale(1);
      }

      .shadow {
        z-index: -1;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        transform: scale(1.2);
        filter: brightness(0) blur(7px);
      }
    }

    .bonus-melting {
      z-index: 10;
      position: absolute;
      left: 15%;
      width: 25%;
      bottom: 0;
      transform-origin: bottom center;
      transform: scale(0);
      transition: transform 300ms;
      mix-blend-mode: darken;

      &.active {
        transform: scale(1);
      }

      .glow {
        z-index: 9; // below melting
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        transform-origin: bottom center;
        transform: scale(1.2);
        filter: blur(6px);
      }
    }

    .completed {
      color: var(--v-success-base);
    }

    .fragments {
      z-index: 0;
      position: absolute;
      left: 15%;
      width: 50%;
      bottom: 0;
      text-shadow: -1px -1px 0.2vw #000, 1px -1px 0.2vw #000, -1px 1px 0.2vw #000, 1px 1px 0.2vw #000;

      .found {
        font-size: 3vw;
        font-weight: bold;
      }

      .required {
        font-size: 2vw;
        font-weight: bold;
      }
    }
  }
</style>
