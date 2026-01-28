<template>
  <div class="fill-height">
    <wotw-map
      class="fill-height"
      @mouseclick="(_event, point) => console.log(point)"
      @transform-changed="(transform) => mapTransform = transform"
    >
      <k-group>
        <rando-map-image
          v-for="tp in displayedTeleporters"
          :key="tp.name"
          :x="tp.x"
          :y="tp.y"
          :width="30"
          :ratio="15 / 30"
          :image="teleporterImage"
          :flip-y="true"
        />
      </k-group>
      <template v-if="mapTransform" #overlay>
        <rando-map-offscreen-indicators
          :items="displayedTeleporters.map(tp => ({position: {x: tp.x, y: tp.y}, name: tp.name, image: tp.image}))"
          :map-transform="mapTransform"
        />
      </template>
    </wotw-map>
  </div>
</template>

<script lang="ts" setup>

  import {ref} from "vue";
  import type Konva from "konva";
  import {Group as KGroup} from 'vue-konva'
  import type {NodeTransform} from "~/assets/utils/mapHelper";

  const layerRef = ref<{ getNode: () => Konva.Layer } | null>(null)
  const mapTransform = ref<NodeTransform>()

  // temp display until seedgen data is available
  const teleporterImage = ref<HTMLImageElement | null>(null)
  const images = import.meta.glob('@shared/images/map/*', {eager: true})
  const teleporters: {
    x: number,
    y: number,
    name: string,
    trackingId: string,
  }[] = [
    {x: -1308, y: -3674, name: "Wellspring", trackingId: "tp_wellspring"},
    {x: -259, y: -3962, name: "Reach", trackingId: "tp_baurs_reach"},
    {x: 576, y: -3610, name: "Shriek", trackingId: "tp_willow_outer"},
    {x: -1656, y: -4171, name: "Luma Boss", trackingId: "tp_luma_pools_west"},
    {x: -1316, y: -4153, name: "Central Luma", trackingId: "tp_luma_pools_east"},
    {x: -307, y: -4153, name: "Glades", trackingId: "tp_wellspring_glades"},
    {x: 422, y: -3864, name: "Willow", trackingId: "tp_willow_inner"},
    {x: 2044, y: -3679, name: "Outer Ruins", trackingId: "tp_windtorn_ruins_outer"},
    {x: -799, y: -4310, name: "Inkwater", trackingId: "tp_inkwater_marsh"},
    {x: -150, y: -4237, name: "Hollow", trackingId: "tp_kwoloks_hollow"},
    {x: 611, y: -4162, name: "Woods Entrance", trackingId: "tp_silent_woods_west"},
    {x: 1083, y: -4052, name: "Woods Exit", trackingId: "tp_silent_woods_east"},
    {x: 1456, y: -3997, name: "Feeding Grounds", trackingId: "tp_windswept_wastes_west"},
    {x: 1992, y: -3902, name: "Central Wastes", trackingId: "tp_windswept_wastes_east"},
    {x: -945, y: -4582, name: "Burrows", trackingId: "tp_midnight_burrows"},
    {x: -328, y: -4536, name: "Den", trackingId: "tp_howls_den"},
    {x: 513, y: -4361, name: "Depths", trackingId: "tp_mouldwood_depths"},
    {x: 2130, y: -3984, name: "Inner Ruins", trackingId: "tp_windtorn_ruins_inner"},
  ]

  const displayedTeleporters = computed(() => {
    const tps: { x: number, y: number, name: string, image: HTMLImageElement | null }[] = []
    teleporters.forEach(({x, y, name}) => {
      tps.push({x, y, name, image: teleporterImage.value})
    })
    return tps
  })

  onMounted(async () => {
    teleporterImage.value = await getImage("teleporter_alt.png")
    if (layerRef.value) {
      // onTransformChange(GetStageTransform(layerRef.value.getNode().getStage()))
    }
  })

  const getImage = (async (imageName: string): Promise<HTMLImageElement | null> => {
    return new Promise((resolve) => {

      const image = new Image()
      const fileEntry = Object.entries(images).find(([path]) =>
        path.endsWith(imageName)
      )
      if (!fileEntry) {
        resolve(null)
        return
      }
      image.src = (fileEntry![1] as { default: string }).default
      console.log(image.src)
      image.onload = () => {
        resolve(image)
      }
    })
  })


</script>

<style lang="scss" scoped>

</style>
