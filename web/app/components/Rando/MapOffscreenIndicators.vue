<template>
  <k-layer>
    <k-group
      v-for="i in indicators"
      :key="i.id"
      :x="i.x"
      :y="i.y"
      :rotation="i.rotation"
    >
      <k-arrow
        :points="[-indicatorSize, 0, 0, 0]"
        :pointerLength="indicatorSize"
        :pointerWidth="indicatorSize"
        fill="lightgrey"
      />
      <rando-map-image
        :x="-30"
        :y="0"
        :width="30"
        :ratio="0.5"
        :image="i.image"
        :rotation="-i.rotation"
      />
    </k-group>
  </k-layer>
</template>

<script lang="ts" setup>
  import type Konva from "konva"
  import {
    Layer as KLayer,
    Group as KGroup,
    Arrow as KArrow,
  } from "vue-konva"
  import {type NodeTransform, MapToOverlay} from "~/assets/utils/mapHelper";

  interface Item {
    name: string,
    position: Konva.Vector2d,
    image: HTMLImageElement | null
  }

  const props = withDefaults(defineProps<{
    mapTransform: NodeTransform,
    items: Item[],
    indicatorSize?: number,
    borderOffset?: number,
  }>(), {
    indicatorSize: 10,
    borderOffset: 10,
  })

  const indicators = computed(() => {

    // calc visible area of map
    const borderLeft = props.borderOffset
    const borderTop = props.borderOffset
    const borderRight = props.mapTransform.width - props.borderOffset
    const borderBottom = props.mapTransform.height - props.borderOffset

    const centerX = (borderLeft + borderRight) / 2
    const centerY = (borderTop + borderBottom) / 2

    return props.items
      .map((item) => ({
        ...item,
        position: MapToOverlay(item.position, props.mapTransform)
      }))
      .filter((item) => {
        return !(
          item.position.x > borderLeft &&
          item.position.x < borderRight &&
          item.position.y > borderTop &&
          item.position.y < borderBottom
        )
      })
      .map((item) => {
        const angle = Math.atan2(item.position.y - centerY, item.position.x - centerX);
        const pos = intersectRayWithBorder(
          centerX,
          centerY,
          item.position.x,
          item.position.y,
          borderLeft,
          borderBottom,
          borderRight,
          borderTop,
        )
        // pos cannot be null, because we filtered for items inside the border
        return {
          id: item.name,
          x: pos!.x,
          y: pos!.y,
          rotation: (angle * 180) / Math.PI,
          image: item.image,
        }
      })
  })

  const intersectRayWithBorder = ((
    centerX: number, centerY: number,
    directionX: number, directionY: number,
    boxX1: number, boxY1: number,
    boxX2: number, boxY2: number,
  ): Konva.Vector2d | null => {

    const intersections: { x: number, y: number, distance: number, direction: number }[] = []
    const boxLines: { x1: number, y1: number, x2: number, y2: number }[] =
      [
        {x1: boxX1, y1: boxY1, x2: boxX1, y2: boxY2},
        {x1: boxX1, y1: boxY2, x2: boxX2, y2: boxY2},
        {x1: boxX2, y1: boxY2, x2: boxX2, y2: boxY1},
        {x1: boxX2, y1: boxY1, x2: boxX1, y2: boxY1},
      ]
    boxLines.forEach(line => {
      const intersection = lineLineIntersection(centerX, centerY, directionX, directionY, line.x1, line.y1, line.x2, line.y2)
      const dir = {x: directionX - centerX, y: directionY - centerY}
      if ((intersection.x - centerX) * dir.x + (intersection.y - centerY) * dir.y >= 0) {

        intersections.push({
          x: intersection.x,
          y: intersection.y,
          distance: getDistance(centerX, centerY, intersection.x, intersection.y),
          direction: ((intersection.x - centerX) * dir.x + (intersection.y - centerY) * dir.y)
        })
      }
    })
    if (!(intersections?.length > 0) || !intersections[0]) {
      return null
    }
    intersections.sort((a, b) => a.distance - b.distance)

    return {
      x: intersections[0].x,
      y: intersections[0].y,
    };
  })

  const lineLineIntersection = ((L1X1: number, L1Y1: number, L1X2: number, L1Y2: number, L2X1: number, L2Y1: number, L2X2: number, L2Y2: number) => {

    const a1 = L1Y2 - L1Y1
    const b1 = L1X1 - L1X2

    const a2 = L2Y2 - L2Y1
    const b2 = L2X1 - L2X2

    const c1 = a1 * L1X1 + b1 * L1Y1
    const c2 = a2 * L2X1 + b2 * L2Y1

    const delta = a1 * b2 - a2 * b1
    return {x: (b2 * c1 - b1 * c2) / delta, y: (a1 * c2 - a2 * c1) / delta}

  })

  const getDistance = ((X1: number, Y1: number, X2: number, Y2: number) => {
    return Math.sqrt(Math.abs(Math.pow((X2 - X1), 2) + Math.pow((Y2 - Y1), 2)))
  })

</script>

<style lang="scss" scoped>

</style>
