import type {
  HashMapStringSchemaResultUniversePresetInfoString,
  HashMapStringSchemaResultWorldPresetInfoString,
} from "./seedgen"

type ValidUniversePresets = {[key: string]: Extract<HashMapStringSchemaResultUniversePresetInfoString[string], { status: "Ok" }> }
type ValidWorldPresets = {[key: string]: Extract<HashMapStringSchemaResultWorldPresetInfoString[string], { status: "Ok" }> }
