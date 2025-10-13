import {WithoutProtoType} from "../proto/ProtoUtil"
import {
  ProtoBingoBoardMessage,
  ProtoBingoUniverseInfo,
  ProtoMultiverseInfoMessage,
  ProtoUserInfo,
} from "../proto/messages"

type UserInfo = WithoutProtoType<ProtoUserInfo>
type MultiverseInfo = WithoutProtoType<ProtoMultiverseInfoMessage>
type BingoBoard = WithoutProtoType<ProtoBingoBoardMessage>
type BingoUniverseInfo = WithoutProtoType<ProtoBingoUniverseInfo>
type MultiverseMetadataInfo = WithoutProtoType<ProtoMultiverseMetadataInfoMessage>

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
