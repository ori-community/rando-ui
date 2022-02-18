import {
  AuthenticateMessage,
  MultiverseInfoMessage,
  Packet,
  RequestUpdatesMessage,
  ResetTracker,
  SyncBingoUniversesMessage,
  SyncBoardMessage,
  TrackerUpdate,
} from './messages'
import { MessageType } from './typeRegistry'

type PacketTypes = {
  [id: number]: MessageType | null,
}

const packetTypes: PacketTypes = {
  1: SyncBoardMessage,
  2: RequestUpdatesMessage,
  4: SyncBingoUniversesMessage,
  8: MultiverseInfoMessage,
  9: AuthenticateMessage,
  12: null,
  100: TrackerUpdate,
  101: ResetTracker,
}

export const blobToArray = async (blob: any) => {
  return new Uint8Array(await new Response(blob).arrayBuffer())
}

export const decodePacket = async (blob: any) => {
  const packet = Packet.decode(await blobToArray(blob))

  if (!(packet.id in packetTypes)) {
    throw new Error(`Invalid packet ID ${packet.id}`)
  }

  if (packetTypes[packet.id] === null) {
    console.debug(`Ignored packet with packed id ${packet.id}`)
    return null
  }

  return packetTypes[packet.id]?.decode(packet.packet)
}

const getPacketId = (type: any) => {
  return Number(Object.keys(packetTypes).find(key => packetTypes[Number(key)] === type))
}

export const makePacket = (type: any, content: object = {}) => {
  return Packet.encode(Packet.fromJSON({
    id: getPacketId(type),
    packet: type.encode(content).finish(),
  })).finish()
}
