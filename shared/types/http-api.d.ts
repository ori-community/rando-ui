import {WithoutProtoType} from "../proto/ProtoUtil"
import {Proto} from "../proto"

type UserInfo = WithoutProtoType<Proto.UserInfo>
type MultiverseInfo = WithoutProtoType<Proto.MultiverseInfoMessage>
type BingoBoard = WithoutProtoType<Proto.BingoBoardMessage>
type BingoUniverseInfo = WithoutProtoType<Proto.BingoUniverseInfo>
type MultiverseMetadataInfo = WithoutProtoType<Proto.MultiverseMetadataInfoMessage>

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
