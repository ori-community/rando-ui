<template>
  <div class="points" v-bind="$attrs" v-on="$listeners"><img src="../assets/images/points.png"> <slot /></div>
</template>

<script>
  export default {
    name: 'WotwExperiencePoints',
  }
</script>

<style lang="scss" scoped>
  .points {
    line-height: 1.1;
    font-size: 0.9em;

    img {
      height: 1em;
      transform: scale(1.2);
      vertical-align: top;
    }
  }
</style>
