import {AsJsonApiType} from "../proto/ProtoUtil"
import {Proto} from "../proto"

type UserInfo = AsJsonApiType<Proto.UserInfo>
type MultiverseInfo = AsJsonApiType<Proto.MultiverseInfoMessage>
type BingoBoard = AsJsonApiType<Proto.BingoBoardMessage>
type BingoUniverseInfo = AsJsonApiType<Proto.BingoUniverseInfo>
type BingoSquare = AsJsonApiType<Proto.BingoSquare>
type MultiverseMetadataInfo = AsJsonApiType<Proto.MultiverseMetadataInfoMessage>
type WorldInfo = AsJsonApiType<Proto.WorldInfo>
type RaceInfo = AsJsonApiType<Proto.RaceInfo>
type RaceTeamInfo = AsJsonApiType<Proto.RaceTeamInfo>
type UniverseInfo = AsJsonApiType<Proto.UniverseInfo>

type BingoData = {
  board: BingoBoard,
  universes: BingoUniverseInfo[],
}

type UniversePreset = {
  // TODO
}

type SeedInfo = {
  id: number,
  worldSeedIds: number[],
  creator: UserInfo,
  config: UniversePreset
}

type SeedgenGenerateResponse = {
  worlds: Uint8Array[],
  textSpoiler: string | null,
  jsonSpoiler: string | null,
}

type BingoSettings = {
  discovery: null | number,
  revealFirstNCompletedGoals: number,
  lockout: boolean,
  size: number,
  goalType: "cards" | "lines" | "all",
  goalAmount: number,
}
