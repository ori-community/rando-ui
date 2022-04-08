<template>
  <div>
    <wotw-devtools-value-indent>
      <template #header>
        Transform
      </template>

      <div class='d-flex small'>
        <div>
          Local
        </div>
        <div class='pl-2'>
          <div>
            Pos: <wotw-devtools-value-renderer-vector3 :value='node.value.local_position' />
          </div>
          <div>
            Rot: <wotw-devtools-value-renderer-vector3 :value='node.value.local_position' />
          </div>
          <div>
            Scale: <wotw-devtools-value-renderer-vector3 :value='node.value.local_position' />
          </div>
        </div>
        <div class='pl-4'>
          World
        </div>
        <div class='pl-2'>
          <div>
            Pos: <wotw-devtools-value-renderer-vector3 :value='node.value.world_position' />
          </div>
          <div>
            Rot: <wotw-devtools-value-renderer-vector3 :value='node.value.world_position' />
          </div>
        </div>
      </div>
    </wotw-devtools-value-indent>
  </div>
</template>

<script>
  export default {
    props: {
      node: {
        type: Object,
        required: true,
      }
    }
  }
</script>

<style lang='scss' scoped>
  .small {
    font-size: 0.75em;
  }
</style>
