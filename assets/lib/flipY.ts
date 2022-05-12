interface HasYComponent {
  y: number,
}

export const flipY = (...values: HasYComponent[]) => {
  for (const value of values) {
    value.y = -value.y
  }
}
