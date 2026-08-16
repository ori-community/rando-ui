import type { PresetGroup, UniversePresetInfo, WorldPresetInfo } from "@shared/types/seedgen"

export type Presets = Record<string, UniversePresetInfo | WorldPresetInfo>
export type GroupedPresetIds = {[G in PresetGroup]?: string[]}
