import {
  type MessageFns,
  AuthenticateMessage,
  MultiverseInfoMessage,
  Packet, RequestFullUpdate,
  RequestUpdatesMessage,
  ResetTracker, SetTrackerEndpointId, ShowUINotificationMessage,
  SyncBingoUniversesMessage,
  SyncBoardMessage, TrackerFlagsUpdate, TrackerTimerStateUpdate,
  TrackerUpdate,
} from "./messages"
import {cloneDeepWith} from "lodash"

type PacketIdMap = {
  [id: number]: MessageFns<PacketType, PacketType["$type"]> | null,
}

export type PacketType =
  SyncBoardMessage |
  RequestUpdatesMessage |
  SyncBingoUniversesMessage |
  MultiverseInfoMessage |
  AuthenticateMessage |
  ShowUINotificationMessage |
  TrackerUpdate |
  ResetTracker |
  TrackerFlagsUpdate |
  RequestFullUpdate |
  SetTrackerEndpointId |
  TrackerTimerStateUpdate

const packetIdMap: PacketIdMap = {
  1: SyncBoardMessage,
  2: RequestUpdatesMessage,
  4: SyncBingoUniversesMessage,
  8: MultiverseInfoMessage,
  9: AuthenticateMessage,
  31: ShowUINotificationMessage,
  12: null,
  100: TrackerUpdate,
  101: ResetTracker,
  102: TrackerFlagsUpdate,
  103: RequestFullUpdate,
  104: SetTrackerEndpointId,
  105: TrackerTimerStateUpdate,
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
  const packet = Packet.decode(await blobToArray(blob))

  if (!(packet.id in packetIdMap)) {
    throw new Error(`Invalid packet ID ${packet.id}`)
  }

  if (packetIdMap[packet.id] === null) {
    console.debug(`Ignored packet with packed id ${packet.id}`)
    return null
  }

  return packetIdMap[packet.id]?.decode(packet.packet) ?? null
}

const getPacketId = (type: any) => {
  return Number(Object.keys(packetIdMap).find(key => packetIdMap[Number(key)] === type))
}

export function makePacket<T>(type: MessageFns<T, string>, content: Omit<T, "$type">) {
  return Packet.encode(Packet.fromPartial({
    id: getPacketId(type),
    packet: type.encode(content as T).finish(),
  })).finish()
}

export function withoutProtoType<T extends PacketType>(message: T): WithoutProtoType<T> {
  return cloneDeepWith(message, (value) => {
    if (typeof value === "object") {
      delete value.$type
    }
  })
}
