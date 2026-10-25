import type {
  HashMapStringSchemaResultPlandoInfoString,
  HashMapStringSchemaResultSnippetInfoString,
  HashMapStringSchemaResultUniversePresetInfoString,
  HashMapStringSchemaResultWorldPresetInfoString, WorldSettings,
} from "./seedgen"
import type {BingoSettings} from "./http-api"

type ValidUniversePresets = {
  [key: string]: Extract<HashMapStringSchemaResultUniversePresetInfoString[string], { status: "Ok" }>["value"]
}
type ValidWorldPresets = {
  [key: string]: Extract<HashMapStringSchemaResultWorldPresetInfoString[string], { status: "Ok" }>["value"]
}
type ValidSnippetInfos = {
  [key: string]: Extract<HashMapStringSchemaResultSnippetInfoString[string], { status: "Ok" }>["value"]
}
type ValidPlandoInfos = {
  [key: string]: Extract<HashMapStringSchemaResultPlandoInfoString[string], { status: "Ok" }>["value"]
}

type SeedgenUiState = {
  version: number,
  worldSettings: WorldSettings[],
  seedString: string | null,
  bingoSettings: BingoSettings,
  enableBingo: boolean,
  enableRaceMode: boolean,
}
