import { RandoProto } from '~/assets/proto/RandoProto'
import { hasOwnProperty } from '~/assets/lib/hasOwnProperty'

const packetTypes = {
  1: RandoProto.SyncBoardMessage,
  2: RandoProto.RequestUpdatesMessage,
  4: RandoProto.SyncBingoUniversesMessage,
  8: RandoProto.MultiverseInfoMessage,
  9: RandoProto.AuthenticateMessage,
  12: null,
}

const getPacketId = (content) => {
  return Object.keys(packetTypes).find(key => packetTypes[key] === content);
}

export const blobToArray = async (blob) => {
  return new Uint8Array(await new Response(blob).arrayBuffer())
}

export const decodePacket = async (blob) => {
  const packet = RandoProto.Packet.decode(await blobToArray(blob))

  if (!hasOwnProperty(packetTypes, packet.id)) {
    throw new Error(`Invalid packet ID ${packet.id}`)
  }

  if (packetTypes[packet.id] === null) {
    console.debug(`Ignored packet with packed id ${packet.id}`)
    return null
  }

  return packetTypes[packet.id].decode(packet.packet)
}

export const makePacket = (type, content) => {
  return RandoProto.Packet.encode({
    id: getPacketId(type),
    packet: type.encode(content).finish()
  }).finish()
}
