import {cloneDeepWith} from "lodash"
import {Proto} from "./index"
import type {MessageType} from "./typeRegistry"
import type {MessageFns} from "./messages"

type PacketIdMap = {
  [id: number]: MessageType | null,
}

export type PacketType =
  Proto.SyncBoardMessage |
  Proto.RequestUpdatesMessage |
  Proto.SyncBingoUniversesMessage |
  Proto.MultiverseInfoMessage |
  Proto.AuthenticateMessage |
  Proto.ShowUINotificationMessage |
  Proto.TrackerUpdate |
  Proto.ResetTracker |
  Proto.TrackerFlagsUpdate |
  Proto.RequestFullUpdate |
  Proto.SetTrackerEndpointId |
  Proto.TrackerTimerStateUpdate |
  Proto.BingoBoardMessage |
  Proto.BingoUniverseInfo

const packetIdMap: PacketIdMap = {
  1: Proto.SyncBoardMessage,
  2: Proto.RequestUpdatesMessage,
  4: Proto.SyncBingoUniversesMessage,
  8: Proto.MultiverseInfoMessage,
  9: Proto.AuthenticateMessage,
  31: Proto.ShowUINotificationMessage,
  12: null,
  100: Proto.TrackerUpdate,
  101: Proto.ResetTracker,
  102: Proto.TrackerFlagsUpdate,
  103: Proto.RequestFullUpdate,
  104: Proto.SetTrackerEndpointId,
  105: Proto.TrackerTimerStateUpdate,
}

export type WithoutProtoType<T> = (
  T extends object
    ? {
      [P in keyof T as P extends "$type" ? never : P]: WithoutProtoType<T[P]>;
    }
    : T
  ) & { $type: never };

export const blobToArray = async (blob: any) => {
  if (typeof window !== "undefined") {
    return new Uint8Array(await new Response(blob).arrayBuffer())
  } else {
    return blob
  }
}

export const decodePacket = async (blob: any) => {
  const packet = Proto.Packet.decode(await blobToArray(blob))

  if (!(packet.id in packetIdMap)) {
    throw new Error(`Invalid packet ID ${packet.id}`)
  }

  if (packetIdMap[packet.id] === null) {
    console.debug(`Ignored packet with packed id ${packet.id}`)
    return null
  }

  return packetIdMap[packet.id]?.decode(packet.packet) as PacketType ?? null
}

const getPacketId = (type: any) => {
  return Number(Object.keys(packetIdMap).find(key => packetIdMap[Number(key)] === type))
}

export function makePacket<T>(type: MessageFns<T, string>, content: Omit<T, "$type">) {
  return Proto.Packet.encode({
    $type: "Proto.Packet",
    id: getPacketId(type),
    packet: type.encode(content as T).finish(),
  }).finish()
}

export function withoutProtoType<T extends PacketType>(message: T): WithoutProtoType<T> {
  return cloneDeepWith(message, (value) => {
    if (typeof value === "object") {
      delete value.$type
    }
  })
}
