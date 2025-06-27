export type UberId = {
  group: number,
  state: number,
}

export type UberState = UberId & {
  value: number,
}
