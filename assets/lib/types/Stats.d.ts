type ZonedMetric = {
  zoneId: number | null,
}

export type NumericMetric = ZonedMetric & {
  type: 'deaths' | 'warps' | 'time' | 'ppm' | 'peak_ppm' | 'peak_ppm_time',
  value: number,
}

export type ProgressionMetric = ZonedMetric & {
  type: 'pickups',
  value: number,
  max: number,
}
