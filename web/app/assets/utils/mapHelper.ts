import type Konva from "konva"

export type NodeTransform = {
  position: Konva.Vector2d,
  scale: Konva.Vector2d,
  width: number,
  height: number
}

export function GetMapTransform(stage: Konva.Node, layer: Konva.Node): NodeTransform {
  const position = layer.position() ?? null
  const scale = layer.scale() ?? null
  return {position, scale, width: stage.width(), height: stage.height()}
}

export function MapToOverlay(position: Konva.Vector2d, mapTransform: NodeTransform): Konva.Vector2d {
  return {
    x: position.x * mapTransform.scale.x + mapTransform.position.x,
    y: position.y * mapTransform.scale.y + mapTransform.position.y,
  }
}


