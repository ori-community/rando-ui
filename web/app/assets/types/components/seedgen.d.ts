import type { PresetGroup, PresetInfo } from "@shared/types/seedgen"

export type Presets = Record<string, {info?: PresetInfo | null}>
export type GroupedPresetIds = {[G in PresetGroup]?: string[]}
