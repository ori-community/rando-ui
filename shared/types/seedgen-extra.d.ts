import type {
  HashMapStringSchemaResultUniversePresetInfoString,
  HashMapStringSchemaResultWorldPresetInfoString, WorldSettings,
} from "./seedgen"
import type {BingoSettings} from "./http-api"

type ValidUniversePresets = {[key: string]: Extract<HashMapStringSchemaResultUniversePresetInfoString[string], { status: "Ok" }> }
type ValidWorldPresets = {[key: string]: Extract<HashMapStringSchemaResultWorldPresetInfoString[string], { status: "Ok" }> }

type SeedgenUiState = {
  version: number,
  worldSettings: WorldSettings[],
  seedString: string | null,
  bingoSettings: BingoSettings,
  enableBingo: boolean,
  enableRaceMode: boolean,
}
