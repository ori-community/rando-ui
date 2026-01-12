export type MapPoint = {
  x: number,
  y: number,
}

export type MapTile = {
  image: HTMLImageElement,
  x: number,
  y: number,
  scale: {
    x: number,
    y: number,
  },
}
