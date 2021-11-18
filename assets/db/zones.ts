// @ts-ignore yaml import...
import zonesData from '@/assets/db/zones.yaml'

interface Zone {
  id: number,
  name: string,
}

export const zones: Zone[] = zonesData
