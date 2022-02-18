<template>
  <div class='resource-view'>
    <div class='resource-line'>
      <img src='@/assets/images/tracker/keystone.png'>
      <div class='value'>0</div>
    </div>
    <div class='resource-line'>
      <img src='@/assets/images/tracker/gorlek_ore.png'>
      <div class='value'>0</div>
    </div>
    <div class='resource-line'>
      <img src='@/assets/images/tracker/spirit_light.png'>
      <div class='value'>0</div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'ResourceView',
    data: () => ({

    })
  }
</script>

<style lang='scss' scoped>
  .resource-view {
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .resource-line {
    display: flex;
    gap: 1em;
    align-items: center;

    img {
      height: 40px;
    }

    .value {
      font-size: 1.2em;
    }
  }
</style>
