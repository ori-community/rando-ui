import {AsJsonApiType, WithoutProtoType} from "../proto/ProtoUtil"
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
