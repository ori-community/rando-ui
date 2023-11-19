/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";
import { messageTypeRegistry } from "./typeRegistry";

export const protobufPackage = "RandoProto";

export interface Packet {
  $type: "RandoProto.Packet";
  id: number;
  packet: Uint8Array;
}

export interface BingoGoal {
  $type: "RandoProto.BingoGoal";
  text: string;
  completed: boolean;
}

export interface UserInfo {
  $type: "RandoProto.UserInfo";
  id: string;
  name: string;
  avatarId?: string | undefined;
  connectedMultiverseId?: number | undefined;
  currentMultiverseId?: number | undefined;
  isDeveloper: boolean;
  points: number;
  raceReady: boolean;
}

export interface WorldInfo {
  $type: "RandoProto.WorldInfo";
  id: number;
  name: string;
  color: string;
  members: UserInfo[];
  seedId?: number | undefined;
}

export interface UniverseInfo {
  $type: "RandoProto.UniverseInfo";
  id: number;
  name: string;
  color: string;
  worlds: WorldInfo[];
}

export interface RaceTeamMemberInfo {
  $type: "RandoProto.RaceTeamMemberInfo";
  id: number;
  user: UserInfo | undefined;
  finishedTime?: number | undefined;
}

export interface RaceTeamInfo {
  $type: "RandoProto.RaceTeamInfo";
  id: number;
  members: RaceTeamMemberInfo[];
  points: number;
  finishedTime?: number | undefined;
}

export interface RaceInfo {
  $type: "RandoProto.RaceInfo";
  id: number;
  teams: RaceTeamInfo[];
  finishedTime?: number | undefined;
}

export interface MultiverseInfoMessage {
  $type: "RandoProto.MultiverseInfoMessage";
  id: number;
  universes: UniverseInfo[];
  hasBingoBoard: boolean;
  spectators: UserInfo[];
  seedId?: number | undefined;
  gameHandlerType: MultiverseInfoMessage_GameHandlerType;
  gameHandlerClientInfo: Uint8Array;
  visibility?: VisibilityMessage | undefined;
  locked: boolean;
  isLockable: boolean;
  race?: RaceInfo | undefined;
  seedSpoilerDownloadedBy: UserInfo[];
}

export enum MultiverseInfoMessage_GameHandlerType {
  Normal = 0,
  HideAndSeek = 1,
  UNRECOGNIZED = -1,
}

export function multiverseInfoMessage_GameHandlerTypeFromJSON(object: any): MultiverseInfoMessage_GameHandlerType {
  switch (object) {
    case 0:
    case "Normal":
      return MultiverseInfoMessage_GameHandlerType.Normal;
    case 1:
    case "HideAndSeek":
      return MultiverseInfoMessage_GameHandlerType.HideAndSeek;
    case -1:
    case "UNRECOGNIZED":
    default:
      return MultiverseInfoMessage_GameHandlerType.UNRECOGNIZED;
  }
}

export function multiverseInfoMessage_GameHandlerTypeToJSON(object: MultiverseInfoMessage_GameHandlerType): string {
  switch (object) {
    case MultiverseInfoMessage_GameHandlerType.Normal:
      return "Normal";
    case MultiverseInfoMessage_GameHandlerType.HideAndSeek:
      return "HideAndSeek";
    case MultiverseInfoMessage_GameHandlerType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface VisibilityMessage {
  $type: "RandoProto.VisibilityMessage";
  hiddenInWorld: string[];
  hiddenOnMap: string[];
}

export interface BingoSquare {
  $type: "RandoProto.BingoSquare";
  text: string;
  completedBy: number[];
  goals: BingoGoal[];
  visibleFor: number[];
}

export interface RequestUpdatesMessage {
  $type: "RandoProto.RequestUpdatesMessage";
  playerId: string;
}

export interface BingoUniverseInfo {
  $type: "RandoProto.BingoUniverseInfo";
  universeId: number;
  score: string;
  rank: number;
  squares: number;
  lines: number;
}

export interface SyncBingoUniversesMessage {
  $type: "RandoProto.SyncBingoUniversesMessage";
  bingoUniverses: BingoUniverseInfo[];
}

export interface Position {
  $type: "RandoProto.Position";
  x: number;
  y: number;
}

export interface PositionedBingoSquare {
  $type: "RandoProto.PositionedBingoSquare";
  position: Position | undefined;
  square: BingoSquare | undefined;
}

export interface BingoBoardMessage {
  $type: "RandoProto.BingoBoardMessage";
  squares: PositionedBingoSquare[];
  size: number;
  lockout: boolean;
}

export interface SyncBoardMessage {
  $type: "RandoProto.SyncBoardMessage";
  board: BingoBoardMessage | undefined;
  replace: boolean;
}

export interface AuthenticateMessage {
  $type: "RandoProto.AuthenticateMessage";
  jwt: string;
}

/** Unused in web */
export interface AuthenticatedMessage {
  $type: "RandoProto.AuthenticatedMessage";
  user: UserInfo | undefined;
  udpId: number;
  udpKey: Uint8Array;
}

export interface PlayerPositionMessage {
  $type: "RandoProto.PlayerPositionMessage";
  x: number;
  y: number;
}

export interface UpdatePlayerPositionMessage {
  $type: "RandoProto.UpdatePlayerPositionMessage";
  playerId: string;
  x: number;
  y: number;
}

export interface UdpPacket {
  $type: "RandoProto.UdpPacket";
  udpId: number;
  encryptedPacket: Uint8Array;
}

/** 100 */
export interface TrackerUpdate {
  $type: "RandoProto.TrackerUpdate";
  id: string;
  value: number;
}

/** 101 */
export interface ResetTracker {
  $type: "RandoProto.ResetTracker";
}

/** 102 */
export interface TrackerFlagsUpdate {
  $type: "RandoProto.TrackerFlagsUpdate";
  flags: string[];
}

/** 103 */
export interface RequestFullUpdate {
  $type: "RandoProto.RequestFullUpdate";
}

/** 104 */
export interface SetTrackerEndpointId {
  $type: "RandoProto.SetTrackerEndpointId";
  endpointId: string;
}

/** 105 */
export interface TrackerTimerStateUpdate {
  $type: "RandoProto.TrackerTimerStateUpdate";
  totalTime: number;
  loadingTime: number;
  timerShouldRun: boolean;
}

export interface NormalGameHandlerState {
  $type: "RandoProto.NormalGameHandlerState";
  raceStartingAt?: number | undefined;
  finishedTime?: number | undefined;
  playerLoadingTimes: { [key: string]: number };
  playerFinishedTimes: { [key: string]: number };
  worldFinishedTimes: { [key: number]: number };
  universeFinishedTimes: { [key: number]: number };
  raceModeEnabled: boolean;
  raceStarted: boolean;
}

export interface NormalGameHandlerState_PlayerLoadingTimesEntry {
  $type: "RandoProto.NormalGameHandlerState.PlayerLoadingTimesEntry";
  key: string;
  value: number;
}

export interface NormalGameHandlerState_PlayerFinishedTimesEntry {
  $type: "RandoProto.NormalGameHandlerState.PlayerFinishedTimesEntry";
  key: string;
  value: number;
}

export interface NormalGameHandlerState_WorldFinishedTimesEntry {
  $type: "RandoProto.NormalGameHandlerState.WorldFinishedTimesEntry";
  key: number;
  value: number;
}

export interface NormalGameHandlerState_UniverseFinishedTimesEntry {
  $type: "RandoProto.NormalGameHandlerState.UniverseFinishedTimesEntry";
  key: number;
  value: number;
}

function createBasePacket(): Packet {
  return { $type: "RandoProto.Packet", id: 0, packet: new Uint8Array(0) };
}

export const Packet = {
  $type: "RandoProto.Packet" as const,

  encode(message: Packet, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).int32(message.id);
    }
    if (message.packet.length !== 0) {
      writer.uint32(18).bytes(message.packet);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Packet {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePacket();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = reader.int32();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.packet = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Packet {
    return {
      $type: Packet.$type,
      id: isSet(object.id) ? Number(object.id) : 0,
      packet: isSet(object.packet) ? bytesFromBase64(object.packet) : new Uint8Array(0),
    };
  },

  toJSON(message: Packet): unknown {
    const obj: any = {};
    if (message.id !== 0) {
      obj.id = Math.round(message.id);
    }
    if (message.packet.length !== 0) {
      obj.packet = base64FromBytes(message.packet);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Packet>, I>>(base?: I): Packet {
    return Packet.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<Packet>, I>>(object: I): Packet {
    const message = createBasePacket();
    message.id = object.id ?? 0;
    message.packet = object.packet ?? new Uint8Array(0);
    return message;
  },
};

messageTypeRegistry.set(Packet.$type, Packet);

function createBaseBingoGoal(): BingoGoal {
  return { $type: "RandoProto.BingoGoal", text: "", completed: false };
}

export const BingoGoal = {
  $type: "RandoProto.BingoGoal" as const,

  encode(message: BingoGoal, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.text !== "") {
      writer.uint32(10).string(message.text);
    }
    if (message.completed === true) {
      writer.uint32(16).bool(message.completed);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BingoGoal {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBingoGoal();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.text = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.completed = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BingoGoal {
    return {
      $type: BingoGoal.$type,
      text: isSet(object.text) ? String(object.text) : "",
      completed: isSet(object.completed) ? Boolean(object.completed) : false,
    };
  },

  toJSON(message: BingoGoal): unknown {
    const obj: any = {};
    if (message.text !== "") {
      obj.text = message.text;
    }
    if (message.completed === true) {
      obj.completed = message.completed;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<BingoGoal>, I>>(base?: I): BingoGoal {
    return BingoGoal.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<BingoGoal>, I>>(object: I): BingoGoal {
    const message = createBaseBingoGoal();
    message.text = object.text ?? "";
    message.completed = object.completed ?? false;
    return message;
  },
};

messageTypeRegistry.set(BingoGoal.$type, BingoGoal);

function createBaseUserInfo(): UserInfo {
  return {
    $type: "RandoProto.UserInfo",
    id: "",
    name: "",
    avatarId: undefined,
    connectedMultiverseId: undefined,
    currentMultiverseId: undefined,
    isDeveloper: false,
    points: 0,
    raceReady: false,
  };
}

export const UserInfo = {
  $type: "RandoProto.UserInfo" as const,

  encode(message: UserInfo, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.name !== "") {
      writer.uint32(18).string(message.name);
    }
    if (message.avatarId !== undefined) {
      writer.uint32(26).string(message.avatarId);
    }
    if (message.connectedMultiverseId !== undefined) {
      writer.uint32(32).int64(message.connectedMultiverseId);
    }
    if (message.currentMultiverseId !== undefined) {
      writer.uint32(40).int64(message.currentMultiverseId);
    }
    if (message.isDeveloper === true) {
      writer.uint32(48).bool(message.isDeveloper);
    }
    if (message.points !== 0) {
      writer.uint32(56).int32(message.points);
    }
    if (message.raceReady === true) {
      writer.uint32(64).bool(message.raceReady);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UserInfo {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUserInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.name = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.avatarId = reader.string();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.connectedMultiverseId = longToNumber(reader.int64() as Long);
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.currentMultiverseId = longToNumber(reader.int64() as Long);
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.isDeveloper = reader.bool();
          continue;
        case 7:
          if (tag !== 56) {
            break;
          }

          message.points = reader.int32();
          continue;
        case 8:
          if (tag !== 64) {
            break;
          }

          message.raceReady = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): UserInfo {
    return {
      $type: UserInfo.$type,
      id: isSet(object.id) ? String(object.id) : "",
      name: isSet(object.name) ? String(object.name) : "",
      avatarId: isSet(object.avatarId) ? String(object.avatarId) : undefined,
      connectedMultiverseId: isSet(object.connectedMultiverseId) ? Number(object.connectedMultiverseId) : undefined,
      currentMultiverseId: isSet(object.currentMultiverseId) ? Number(object.currentMultiverseId) : undefined,
      isDeveloper: isSet(object.isDeveloper) ? Boolean(object.isDeveloper) : false,
      points: isSet(object.points) ? Number(object.points) : 0,
      raceReady: isSet(object.raceReady) ? Boolean(object.raceReady) : false,
    };
  },

  toJSON(message: UserInfo): unknown {
    const obj: any = {};
    if (message.id !== "") {
      obj.id = message.id;
    }
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.avatarId !== undefined) {
      obj.avatarId = message.avatarId;
    }
    if (message.connectedMultiverseId !== undefined) {
      obj.connectedMultiverseId = Math.round(message.connectedMultiverseId);
    }
    if (message.currentMultiverseId !== undefined) {
      obj.currentMultiverseId = Math.round(message.currentMultiverseId);
    }
    if (message.isDeveloper === true) {
      obj.isDeveloper = message.isDeveloper;
    }
    if (message.points !== 0) {
      obj.points = Math.round(message.points);
    }
    if (message.raceReady === true) {
      obj.raceReady = message.raceReady;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<UserInfo>, I>>(base?: I): UserInfo {
    return UserInfo.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<UserInfo>, I>>(object: I): UserInfo {
    const message = createBaseUserInfo();
    message.id = object.id ?? "";
    message.name = object.name ?? "";
    message.avatarId = object.avatarId ?? undefined;
    message.connectedMultiverseId = object.connectedMultiverseId ?? undefined;
    message.currentMultiverseId = object.currentMultiverseId ?? undefined;
    message.isDeveloper = object.isDeveloper ?? false;
    message.points = object.points ?? 0;
    message.raceReady = object.raceReady ?? false;
    return message;
  },
};

messageTypeRegistry.set(UserInfo.$type, UserInfo);

function createBaseWorldInfo(): WorldInfo {
  return { $type: "RandoProto.WorldInfo", id: 0, name: "", color: "", members: [], seedId: undefined };
}

export const WorldInfo = {
  $type: "RandoProto.WorldInfo" as const,

  encode(message: WorldInfo, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).int64(message.id);
    }
    if (message.name !== "") {
      writer.uint32(18).string(message.name);
    }
    if (message.color !== "") {
      writer.uint32(26).string(message.color);
    }
    for (const v of message.members) {
      UserInfo.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    if (message.seedId !== undefined) {
      writer.uint32(40).int64(message.seedId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): WorldInfo {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseWorldInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.int64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.name = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.color = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.members.push(UserInfo.decode(reader, reader.uint32()));
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.seedId = longToNumber(reader.int64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): WorldInfo {
    return {
      $type: WorldInfo.$type,
      id: isSet(object.id) ? Number(object.id) : 0,
      name: isSet(object.name) ? String(object.name) : "",
      color: isSet(object.color) ? String(object.color) : "",
      members: Array.isArray(object?.members) ? object.members.map((e: any) => UserInfo.fromJSON(e)) : [],
      seedId: isSet(object.seedId) ? Number(object.seedId) : undefined,
    };
  },

  toJSON(message: WorldInfo): unknown {
    const obj: any = {};
    if (message.id !== 0) {
      obj.id = Math.round(message.id);
    }
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.color !== "") {
      obj.color = message.color;
    }
    if (message.members?.length) {
      obj.members = message.members.map((e) => UserInfo.toJSON(e));
    }
    if (message.seedId !== undefined) {
      obj.seedId = Math.round(message.seedId);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<WorldInfo>, I>>(base?: I): WorldInfo {
    return WorldInfo.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<WorldInfo>, I>>(object: I): WorldInfo {
    const message = createBaseWorldInfo();
    message.id = object.id ?? 0;
    message.name = object.name ?? "";
    message.color = object.color ?? "";
    message.members = object.members?.map((e) => UserInfo.fromPartial(e)) || [];
    message.seedId = object.seedId ?? undefined;
    return message;
  },
};

messageTypeRegistry.set(WorldInfo.$type, WorldInfo);

function createBaseUniverseInfo(): UniverseInfo {
  return { $type: "RandoProto.UniverseInfo", id: 0, name: "", color: "", worlds: [] };
}

export const UniverseInfo = {
  $type: "RandoProto.UniverseInfo" as const,

  encode(message: UniverseInfo, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).int64(message.id);
    }
    if (message.name !== "") {
      writer.uint32(18).string(message.name);
    }
    if (message.color !== "") {
      writer.uint32(26).string(message.color);
    }
    for (const v of message.worlds) {
      WorldInfo.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UniverseInfo {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUniverseInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.int64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.name = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.color = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.worlds.push(WorldInfo.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): UniverseInfo {
    return {
      $type: UniverseInfo.$type,
      id: isSet(object.id) ? Number(object.id) : 0,
      name: isSet(object.name) ? String(object.name) : "",
      color: isSet(object.color) ? String(object.color) : "",
      worlds: Array.isArray(object?.worlds) ? object.worlds.map((e: any) => WorldInfo.fromJSON(e)) : [],
    };
  },

  toJSON(message: UniverseInfo): unknown {
    const obj: any = {};
    if (message.id !== 0) {
      obj.id = Math.round(message.id);
    }
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.color !== "") {
      obj.color = message.color;
    }
    if (message.worlds?.length) {
      obj.worlds = message.worlds.map((e) => WorldInfo.toJSON(e));
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<UniverseInfo>, I>>(base?: I): UniverseInfo {
    return UniverseInfo.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<UniverseInfo>, I>>(object: I): UniverseInfo {
    const message = createBaseUniverseInfo();
    message.id = object.id ?? 0;
    message.name = object.name ?? "";
    message.color = object.color ?? "";
    message.worlds = object.worlds?.map((e) => WorldInfo.fromPartial(e)) || [];
    return message;
  },
};

messageTypeRegistry.set(UniverseInfo.$type, UniverseInfo);

function createBaseRaceTeamMemberInfo(): RaceTeamMemberInfo {
  return { $type: "RandoProto.RaceTeamMemberInfo", id: 0, user: undefined, finishedTime: undefined };
}

export const RaceTeamMemberInfo = {
  $type: "RandoProto.RaceTeamMemberInfo" as const,

  encode(message: RaceTeamMemberInfo, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).int64(message.id);
    }
    if (message.user !== undefined) {
      UserInfo.encode(message.user, writer.uint32(18).fork()).ldelim();
    }
    if (message.finishedTime !== undefined) {
      writer.uint32(29).float(message.finishedTime);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RaceTeamMemberInfo {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRaceTeamMemberInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.int64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.user = UserInfo.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 29) {
            break;
          }

          message.finishedTime = reader.float();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): RaceTeamMemberInfo {
    return {
      $type: RaceTeamMemberInfo.$type,
      id: isSet(object.id) ? Number(object.id) : 0,
      user: isSet(object.user) ? UserInfo.fromJSON(object.user) : undefined,
      finishedTime: isSet(object.finishedTime) ? Number(object.finishedTime) : undefined,
    };
  },

  toJSON(message: RaceTeamMemberInfo): unknown {
    const obj: any = {};
    if (message.id !== 0) {
      obj.id = Math.round(message.id);
    }
    if (message.user !== undefined) {
      obj.user = UserInfo.toJSON(message.user);
    }
    if (message.finishedTime !== undefined) {
      obj.finishedTime = message.finishedTime;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<RaceTeamMemberInfo>, I>>(base?: I): RaceTeamMemberInfo {
    return RaceTeamMemberInfo.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<RaceTeamMemberInfo>, I>>(object: I): RaceTeamMemberInfo {
    const message = createBaseRaceTeamMemberInfo();
    message.id = object.id ?? 0;
    message.user = (object.user !== undefined && object.user !== null) ? UserInfo.fromPartial(object.user) : undefined;
    message.finishedTime = object.finishedTime ?? undefined;
    return message;
  },
};

messageTypeRegistry.set(RaceTeamMemberInfo.$type, RaceTeamMemberInfo);

function createBaseRaceTeamInfo(): RaceTeamInfo {
  return { $type: "RandoProto.RaceTeamInfo", id: 0, members: [], points: 0, finishedTime: undefined };
}

export const RaceTeamInfo = {
  $type: "RandoProto.RaceTeamInfo" as const,

  encode(message: RaceTeamInfo, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).int64(message.id);
    }
    for (const v of message.members) {
      RaceTeamMemberInfo.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    if (message.points !== 0) {
      writer.uint32(24).int32(message.points);
    }
    if (message.finishedTime !== undefined) {
      writer.uint32(37).float(message.finishedTime);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RaceTeamInfo {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRaceTeamInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.int64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.members.push(RaceTeamMemberInfo.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.points = reader.int32();
          continue;
        case 4:
          if (tag !== 37) {
            break;
          }

          message.finishedTime = reader.float();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): RaceTeamInfo {
    return {
      $type: RaceTeamInfo.$type,
      id: isSet(object.id) ? Number(object.id) : 0,
      members: Array.isArray(object?.members) ? object.members.map((e: any) => RaceTeamMemberInfo.fromJSON(e)) : [],
      points: isSet(object.points) ? Number(object.points) : 0,
      finishedTime: isSet(object.finishedTime) ? Number(object.finishedTime) : undefined,
    };
  },

  toJSON(message: RaceTeamInfo): unknown {
    const obj: any = {};
    if (message.id !== 0) {
      obj.id = Math.round(message.id);
    }
    if (message.members?.length) {
      obj.members = message.members.map((e) => RaceTeamMemberInfo.toJSON(e));
    }
    if (message.points !== 0) {
      obj.points = Math.round(message.points);
    }
    if (message.finishedTime !== undefined) {
      obj.finishedTime = message.finishedTime;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<RaceTeamInfo>, I>>(base?: I): RaceTeamInfo {
    return RaceTeamInfo.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<RaceTeamInfo>, I>>(object: I): RaceTeamInfo {
    const message = createBaseRaceTeamInfo();
    message.id = object.id ?? 0;
    message.members = object.members?.map((e) => RaceTeamMemberInfo.fromPartial(e)) || [];
    message.points = object.points ?? 0;
    message.finishedTime = object.finishedTime ?? undefined;
    return message;
  },
};

messageTypeRegistry.set(RaceTeamInfo.$type, RaceTeamInfo);

function createBaseRaceInfo(): RaceInfo {
  return { $type: "RandoProto.RaceInfo", id: 0, teams: [], finishedTime: undefined };
}

export const RaceInfo = {
  $type: "RandoProto.RaceInfo" as const,

  encode(message: RaceInfo, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).int64(message.id);
    }
    for (const v of message.teams) {
      RaceTeamInfo.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    if (message.finishedTime !== undefined) {
      writer.uint32(29).float(message.finishedTime);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RaceInfo {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRaceInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.int64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.teams.push(RaceTeamInfo.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag !== 29) {
            break;
          }

          message.finishedTime = reader.float();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): RaceInfo {
    return {
      $type: RaceInfo.$type,
      id: isSet(object.id) ? Number(object.id) : 0,
      teams: Array.isArray(object?.teams) ? object.teams.map((e: any) => RaceTeamInfo.fromJSON(e)) : [],
      finishedTime: isSet(object.finishedTime) ? Number(object.finishedTime) : undefined,
    };
  },

  toJSON(message: RaceInfo): unknown {
    const obj: any = {};
    if (message.id !== 0) {
      obj.id = Math.round(message.id);
    }
    if (message.teams?.length) {
      obj.teams = message.teams.map((e) => RaceTeamInfo.toJSON(e));
    }
    if (message.finishedTime !== undefined) {
      obj.finishedTime = message.finishedTime;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<RaceInfo>, I>>(base?: I): RaceInfo {
    return RaceInfo.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<RaceInfo>, I>>(object: I): RaceInfo {
    const message = createBaseRaceInfo();
    message.id = object.id ?? 0;
    message.teams = object.teams?.map((e) => RaceTeamInfo.fromPartial(e)) || [];
    message.finishedTime = object.finishedTime ?? undefined;
    return message;
  },
};

messageTypeRegistry.set(RaceInfo.$type, RaceInfo);

function createBaseMultiverseInfoMessage(): MultiverseInfoMessage {
  return {
    $type: "RandoProto.MultiverseInfoMessage",
    id: 0,
    universes: [],
    hasBingoBoard: false,
    spectators: [],
    seedId: undefined,
    gameHandlerType: 0,
    gameHandlerClientInfo: new Uint8Array(0),
    visibility: undefined,
    locked: false,
    isLockable: false,
    race: undefined,
    seedSpoilerDownloadedBy: [],
  };
}

export const MultiverseInfoMessage = {
  $type: "RandoProto.MultiverseInfoMessage" as const,

  encode(message: MultiverseInfoMessage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).int64(message.id);
    }
    for (const v of message.universes) {
      UniverseInfo.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    if (message.hasBingoBoard === true) {
      writer.uint32(24).bool(message.hasBingoBoard);
    }
    for (const v of message.spectators) {
      UserInfo.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    if (message.seedId !== undefined) {
      writer.uint32(40).int64(message.seedId);
    }
    if (message.gameHandlerType !== 0) {
      writer.uint32(48).int32(message.gameHandlerType);
    }
    if (message.gameHandlerClientInfo.length !== 0) {
      writer.uint32(58).bytes(message.gameHandlerClientInfo);
    }
    if (message.visibility !== undefined) {
      VisibilityMessage.encode(message.visibility, writer.uint32(66).fork()).ldelim();
    }
    if (message.locked === true) {
      writer.uint32(72).bool(message.locked);
    }
    if (message.isLockable === true) {
      writer.uint32(80).bool(message.isLockable);
    }
    if (message.race !== undefined) {
      RaceInfo.encode(message.race, writer.uint32(90).fork()).ldelim();
    }
    for (const v of message.seedSpoilerDownloadedBy) {
      UserInfo.encode(v!, writer.uint32(98).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MultiverseInfoMessage {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMultiverseInfoMessage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.int64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.universes.push(UniverseInfo.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.hasBingoBoard = reader.bool();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.spectators.push(UserInfo.decode(reader, reader.uint32()));
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.seedId = longToNumber(reader.int64() as Long);
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.gameHandlerType = reader.int32() as any;
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.gameHandlerClientInfo = reader.bytes();
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.visibility = VisibilityMessage.decode(reader, reader.uint32());
          continue;
        case 9:
          if (tag !== 72) {
            break;
          }

          message.locked = reader.bool();
          continue;
        case 10:
          if (tag !== 80) {
            break;
          }

          message.isLockable = reader.bool();
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }

          message.race = RaceInfo.decode(reader, reader.uint32());
          continue;
        case 12:
          if (tag !== 98) {
            break;
          }

          message.seedSpoilerDownloadedBy.push(UserInfo.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MultiverseInfoMessage {
    return {
      $type: MultiverseInfoMessage.$type,
      id: isSet(object.id) ? Number(object.id) : 0,
      universes: Array.isArray(object?.universes) ? object.universes.map((e: any) => UniverseInfo.fromJSON(e)) : [],
      hasBingoBoard: isSet(object.hasBingoBoard) ? Boolean(object.hasBingoBoard) : false,
      spectators: Array.isArray(object?.spectators) ? object.spectators.map((e: any) => UserInfo.fromJSON(e)) : [],
      seedId: isSet(object.seedId) ? Number(object.seedId) : undefined,
      gameHandlerType: isSet(object.gameHandlerType)
        ? multiverseInfoMessage_GameHandlerTypeFromJSON(object.gameHandlerType)
        : 0,
      gameHandlerClientInfo: isSet(object.gameHandlerClientInfo)
        ? bytesFromBase64(object.gameHandlerClientInfo)
        : new Uint8Array(0),
      visibility: isSet(object.visibility) ? VisibilityMessage.fromJSON(object.visibility) : undefined,
      locked: isSet(object.locked) ? Boolean(object.locked) : false,
      isLockable: isSet(object.isLockable) ? Boolean(object.isLockable) : false,
      race: isSet(object.race) ? RaceInfo.fromJSON(object.race) : undefined,
      seedSpoilerDownloadedBy: Array.isArray(object?.seedSpoilerDownloadedBy)
        ? object.seedSpoilerDownloadedBy.map((e: any) => UserInfo.fromJSON(e))
        : [],
    };
  },

  toJSON(message: MultiverseInfoMessage): unknown {
    const obj: any = {};
    if (message.id !== 0) {
      obj.id = Math.round(message.id);
    }
    if (message.universes?.length) {
      obj.universes = message.universes.map((e) => UniverseInfo.toJSON(e));
    }
    if (message.hasBingoBoard === true) {
      obj.hasBingoBoard = message.hasBingoBoard;
    }
    if (message.spectators?.length) {
      obj.spectators = message.spectators.map((e) => UserInfo.toJSON(e));
    }
    if (message.seedId !== undefined) {
      obj.seedId = Math.round(message.seedId);
    }
    if (message.gameHandlerType !== 0) {
      obj.gameHandlerType = multiverseInfoMessage_GameHandlerTypeToJSON(message.gameHandlerType);
    }
    if (message.gameHandlerClientInfo.length !== 0) {
      obj.gameHandlerClientInfo = base64FromBytes(message.gameHandlerClientInfo);
    }
    if (message.visibility !== undefined) {
      obj.visibility = VisibilityMessage.toJSON(message.visibility);
    }
    if (message.locked === true) {
      obj.locked = message.locked;
    }
    if (message.isLockable === true) {
      obj.isLockable = message.isLockable;
    }
    if (message.race !== undefined) {
      obj.race = RaceInfo.toJSON(message.race);
    }
    if (message.seedSpoilerDownloadedBy?.length) {
      obj.seedSpoilerDownloadedBy = message.seedSpoilerDownloadedBy.map((e) => UserInfo.toJSON(e));
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MultiverseInfoMessage>, I>>(base?: I): MultiverseInfoMessage {
    return MultiverseInfoMessage.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MultiverseInfoMessage>, I>>(object: I): MultiverseInfoMessage {
    const message = createBaseMultiverseInfoMessage();
    message.id = object.id ?? 0;
    message.universes = object.universes?.map((e) => UniverseInfo.fromPartial(e)) || [];
    message.hasBingoBoard = object.hasBingoBoard ?? false;
    message.spectators = object.spectators?.map((e) => UserInfo.fromPartial(e)) || [];
    message.seedId = object.seedId ?? undefined;
    message.gameHandlerType = object.gameHandlerType ?? 0;
    message.gameHandlerClientInfo = object.gameHandlerClientInfo ?? new Uint8Array(0);
    message.visibility = (object.visibility !== undefined && object.visibility !== null)
      ? VisibilityMessage.fromPartial(object.visibility)
      : undefined;
    message.locked = object.locked ?? false;
    message.isLockable = object.isLockable ?? false;
    message.race = (object.race !== undefined && object.race !== null) ? RaceInfo.fromPartial(object.race) : undefined;
    message.seedSpoilerDownloadedBy = object.seedSpoilerDownloadedBy?.map((e) => UserInfo.fromPartial(e)) || [];
    return message;
  },
};

messageTypeRegistry.set(MultiverseInfoMessage.$type, MultiverseInfoMessage);

function createBaseVisibilityMessage(): VisibilityMessage {
  return { $type: "RandoProto.VisibilityMessage", hiddenInWorld: [], hiddenOnMap: [] };
}

export const VisibilityMessage = {
  $type: "RandoProto.VisibilityMessage" as const,

  encode(message: VisibilityMessage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.hiddenInWorld) {
      writer.uint32(10).string(v!);
    }
    for (const v of message.hiddenOnMap) {
      writer.uint32(18).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): VisibilityMessage {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseVisibilityMessage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.hiddenInWorld.push(reader.string());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.hiddenOnMap.push(reader.string());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): VisibilityMessage {
    return {
      $type: VisibilityMessage.$type,
      hiddenInWorld: Array.isArray(object?.hiddenInWorld) ? object.hiddenInWorld.map((e: any) => String(e)) : [],
      hiddenOnMap: Array.isArray(object?.hiddenOnMap) ? object.hiddenOnMap.map((e: any) => String(e)) : [],
    };
  },

  toJSON(message: VisibilityMessage): unknown {
    const obj: any = {};
    if (message.hiddenInWorld?.length) {
      obj.hiddenInWorld = message.hiddenInWorld;
    }
    if (message.hiddenOnMap?.length) {
      obj.hiddenOnMap = message.hiddenOnMap;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<VisibilityMessage>, I>>(base?: I): VisibilityMessage {
    return VisibilityMessage.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<VisibilityMessage>, I>>(object: I): VisibilityMessage {
    const message = createBaseVisibilityMessage();
    message.hiddenInWorld = object.hiddenInWorld?.map((e) => e) || [];
    message.hiddenOnMap = object.hiddenOnMap?.map((e) => e) || [];
    return message;
  },
};

messageTypeRegistry.set(VisibilityMessage.$type, VisibilityMessage);

function createBaseBingoSquare(): BingoSquare {
  return { $type: "RandoProto.BingoSquare", text: "", completedBy: [], goals: [], visibleFor: [] };
}

export const BingoSquare = {
  $type: "RandoProto.BingoSquare" as const,

  encode(message: BingoSquare, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.text !== "") {
      writer.uint32(10).string(message.text);
    }
    writer.uint32(18).fork();
    for (const v of message.completedBy) {
      writer.int64(v);
    }
    writer.ldelim();
    for (const v of message.goals) {
      BingoGoal.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    writer.uint32(34).fork();
    for (const v of message.visibleFor) {
      writer.int64(v);
    }
    writer.ldelim();
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BingoSquare {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBingoSquare();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.text = reader.string();
          continue;
        case 2:
          if (tag === 16) {
            message.completedBy.push(longToNumber(reader.int64() as Long));

            continue;
          }

          if (tag === 18) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.completedBy.push(longToNumber(reader.int64() as Long));
            }

            continue;
          }

          break;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.goals.push(BingoGoal.decode(reader, reader.uint32()));
          continue;
        case 4:
          if (tag === 32) {
            message.visibleFor.push(longToNumber(reader.int64() as Long));

            continue;
          }

          if (tag === 34) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.visibleFor.push(longToNumber(reader.int64() as Long));
            }

            continue;
          }

          break;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BingoSquare {
    return {
      $type: BingoSquare.$type,
      text: isSet(object.text) ? String(object.text) : "",
      completedBy: Array.isArray(object?.completedBy) ? object.completedBy.map((e: any) => Number(e)) : [],
      goals: Array.isArray(object?.goals) ? object.goals.map((e: any) => BingoGoal.fromJSON(e)) : [],
      visibleFor: Array.isArray(object?.visibleFor) ? object.visibleFor.map((e: any) => Number(e)) : [],
    };
  },

  toJSON(message: BingoSquare): unknown {
    const obj: any = {};
    if (message.text !== "") {
      obj.text = message.text;
    }
    if (message.completedBy?.length) {
      obj.completedBy = message.completedBy.map((e) => Math.round(e));
    }
    if (message.goals?.length) {
      obj.goals = message.goals.map((e) => BingoGoal.toJSON(e));
    }
    if (message.visibleFor?.length) {
      obj.visibleFor = message.visibleFor.map((e) => Math.round(e));
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<BingoSquare>, I>>(base?: I): BingoSquare {
    return BingoSquare.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<BingoSquare>, I>>(object: I): BingoSquare {
    const message = createBaseBingoSquare();
    message.text = object.text ?? "";
    message.completedBy = object.completedBy?.map((e) => e) || [];
    message.goals = object.goals?.map((e) => BingoGoal.fromPartial(e)) || [];
    message.visibleFor = object.visibleFor?.map((e) => e) || [];
    return message;
  },
};

messageTypeRegistry.set(BingoSquare.$type, BingoSquare);

function createBaseRequestUpdatesMessage(): RequestUpdatesMessage {
  return { $type: "RandoProto.RequestUpdatesMessage", playerId: "" };
}

export const RequestUpdatesMessage = {
  $type: "RandoProto.RequestUpdatesMessage" as const,

  encode(message: RequestUpdatesMessage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.playerId !== "") {
      writer.uint32(10).string(message.playerId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RequestUpdatesMessage {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRequestUpdatesMessage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.playerId = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): RequestUpdatesMessage {
    return { $type: RequestUpdatesMessage.$type, playerId: isSet(object.playerId) ? String(object.playerId) : "" };
  },

  toJSON(message: RequestUpdatesMessage): unknown {
    const obj: any = {};
    if (message.playerId !== "") {
      obj.playerId = message.playerId;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<RequestUpdatesMessage>, I>>(base?: I): RequestUpdatesMessage {
    return RequestUpdatesMessage.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<RequestUpdatesMessage>, I>>(object: I): RequestUpdatesMessage {
    const message = createBaseRequestUpdatesMessage();
    message.playerId = object.playerId ?? "";
    return message;
  },
};

messageTypeRegistry.set(RequestUpdatesMessage.$type, RequestUpdatesMessage);

function createBaseBingoUniverseInfo(): BingoUniverseInfo {
  return { $type: "RandoProto.BingoUniverseInfo", universeId: 0, score: "", rank: 0, squares: 0, lines: 0 };
}

export const BingoUniverseInfo = {
  $type: "RandoProto.BingoUniverseInfo" as const,

  encode(message: BingoUniverseInfo, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.universeId !== 0) {
      writer.uint32(8).int64(message.universeId);
    }
    if (message.score !== "") {
      writer.uint32(26).string(message.score);
    }
    if (message.rank !== 0) {
      writer.uint32(32).int32(message.rank);
    }
    if (message.squares !== 0) {
      writer.uint32(40).int32(message.squares);
    }
    if (message.lines !== 0) {
      writer.uint32(48).int32(message.lines);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BingoUniverseInfo {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBingoUniverseInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.universeId = longToNumber(reader.int64() as Long);
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.score = reader.string();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.rank = reader.int32();
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.squares = reader.int32();
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.lines = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BingoUniverseInfo {
    return {
      $type: BingoUniverseInfo.$type,
      universeId: isSet(object.universeId) ? Number(object.universeId) : 0,
      score: isSet(object.score) ? String(object.score) : "",
      rank: isSet(object.rank) ? Number(object.rank) : 0,
      squares: isSet(object.squares) ? Number(object.squares) : 0,
      lines: isSet(object.lines) ? Number(object.lines) : 0,
    };
  },

  toJSON(message: BingoUniverseInfo): unknown {
    const obj: any = {};
    if (message.universeId !== 0) {
      obj.universeId = Math.round(message.universeId);
    }
    if (message.score !== "") {
      obj.score = message.score;
    }
    if (message.rank !== 0) {
      obj.rank = Math.round(message.rank);
    }
    if (message.squares !== 0) {
      obj.squares = Math.round(message.squares);
    }
    if (message.lines !== 0) {
      obj.lines = Math.round(message.lines);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<BingoUniverseInfo>, I>>(base?: I): BingoUniverseInfo {
    return BingoUniverseInfo.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<BingoUniverseInfo>, I>>(object: I): BingoUniverseInfo {
    const message = createBaseBingoUniverseInfo();
    message.universeId = object.universeId ?? 0;
    message.score = object.score ?? "";
    message.rank = object.rank ?? 0;
    message.squares = object.squares ?? 0;
    message.lines = object.lines ?? 0;
    return message;
  },
};

messageTypeRegistry.set(BingoUniverseInfo.$type, BingoUniverseInfo);

function createBaseSyncBingoUniversesMessage(): SyncBingoUniversesMessage {
  return { $type: "RandoProto.SyncBingoUniversesMessage", bingoUniverses: [] };
}

export const SyncBingoUniversesMessage = {
  $type: "RandoProto.SyncBingoUniversesMessage" as const,

  encode(message: SyncBingoUniversesMessage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.bingoUniverses) {
      BingoUniverseInfo.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SyncBingoUniversesMessage {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSyncBingoUniversesMessage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.bingoUniverses.push(BingoUniverseInfo.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): SyncBingoUniversesMessage {
    return {
      $type: SyncBingoUniversesMessage.$type,
      bingoUniverses: Array.isArray(object?.bingoUniverses)
        ? object.bingoUniverses.map((e: any) => BingoUniverseInfo.fromJSON(e))
        : [],
    };
  },

  toJSON(message: SyncBingoUniversesMessage): unknown {
    const obj: any = {};
    if (message.bingoUniverses?.length) {
      obj.bingoUniverses = message.bingoUniverses.map((e) => BingoUniverseInfo.toJSON(e));
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<SyncBingoUniversesMessage>, I>>(base?: I): SyncBingoUniversesMessage {
    return SyncBingoUniversesMessage.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<SyncBingoUniversesMessage>, I>>(object: I): SyncBingoUniversesMessage {
    const message = createBaseSyncBingoUniversesMessage();
    message.bingoUniverses = object.bingoUniverses?.map((e) => BingoUniverseInfo.fromPartial(e)) || [];
    return message;
  },
};

messageTypeRegistry.set(SyncBingoUniversesMessage.$type, SyncBingoUniversesMessage);

function createBasePosition(): Position {
  return { $type: "RandoProto.Position", x: 0, y: 0 };
}

export const Position = {
  $type: "RandoProto.Position" as const,

  encode(message: Position, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.x !== 0) {
      writer.uint32(8).int32(message.x);
    }
    if (message.y !== 0) {
      writer.uint32(16).int32(message.y);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Position {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePosition();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.x = reader.int32();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.y = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Position {
    return {
      $type: Position.$type,
      x: isSet(object.x) ? Number(object.x) : 0,
      y: isSet(object.y) ? Number(object.y) : 0,
    };
  },

  toJSON(message: Position): unknown {
    const obj: any = {};
    if (message.x !== 0) {
      obj.x = Math.round(message.x);
    }
    if (message.y !== 0) {
      obj.y = Math.round(message.y);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Position>, I>>(base?: I): Position {
    return Position.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<Position>, I>>(object: I): Position {
    const message = createBasePosition();
    message.x = object.x ?? 0;
    message.y = object.y ?? 0;
    return message;
  },
};

messageTypeRegistry.set(Position.$type, Position);

function createBasePositionedBingoSquare(): PositionedBingoSquare {
  return { $type: "RandoProto.PositionedBingoSquare", position: undefined, square: undefined };
}

export const PositionedBingoSquare = {
  $type: "RandoProto.PositionedBingoSquare" as const,

  encode(message: PositionedBingoSquare, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.position !== undefined) {
      Position.encode(message.position, writer.uint32(10).fork()).ldelim();
    }
    if (message.square !== undefined) {
      BingoSquare.encode(message.square, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PositionedBingoSquare {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePositionedBingoSquare();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.position = Position.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.square = BingoSquare.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): PositionedBingoSquare {
    return {
      $type: PositionedBingoSquare.$type,
      position: isSet(object.position) ? Position.fromJSON(object.position) : undefined,
      square: isSet(object.square) ? BingoSquare.fromJSON(object.square) : undefined,
    };
  },

  toJSON(message: PositionedBingoSquare): unknown {
    const obj: any = {};
    if (message.position !== undefined) {
      obj.position = Position.toJSON(message.position);
    }
    if (message.square !== undefined) {
      obj.square = BingoSquare.toJSON(message.square);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<PositionedBingoSquare>, I>>(base?: I): PositionedBingoSquare {
    return PositionedBingoSquare.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<PositionedBingoSquare>, I>>(object: I): PositionedBingoSquare {
    const message = createBasePositionedBingoSquare();
    message.position = (object.position !== undefined && object.position !== null)
      ? Position.fromPartial(object.position)
      : undefined;
    message.square = (object.square !== undefined && object.square !== null)
      ? BingoSquare.fromPartial(object.square)
      : undefined;
    return message;
  },
};

messageTypeRegistry.set(PositionedBingoSquare.$type, PositionedBingoSquare);

function createBaseBingoBoardMessage(): BingoBoardMessage {
  return { $type: "RandoProto.BingoBoardMessage", squares: [], size: 0, lockout: false };
}

export const BingoBoardMessage = {
  $type: "RandoProto.BingoBoardMessage" as const,

  encode(message: BingoBoardMessage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.squares) {
      PositionedBingoSquare.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.size !== 0) {
      writer.uint32(16).int32(message.size);
    }
    if (message.lockout === true) {
      writer.uint32(24).bool(message.lockout);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BingoBoardMessage {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBingoBoardMessage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.squares.push(PositionedBingoSquare.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.size = reader.int32();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.lockout = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BingoBoardMessage {
    return {
      $type: BingoBoardMessage.$type,
      squares: Array.isArray(object?.squares) ? object.squares.map((e: any) => PositionedBingoSquare.fromJSON(e)) : [],
      size: isSet(object.size) ? Number(object.size) : 0,
      lockout: isSet(object.lockout) ? Boolean(object.lockout) : false,
    };
  },

  toJSON(message: BingoBoardMessage): unknown {
    const obj: any = {};
    if (message.squares?.length) {
      obj.squares = message.squares.map((e) => PositionedBingoSquare.toJSON(e));
    }
    if (message.size !== 0) {
      obj.size = Math.round(message.size);
    }
    if (message.lockout === true) {
      obj.lockout = message.lockout;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<BingoBoardMessage>, I>>(base?: I): BingoBoardMessage {
    return BingoBoardMessage.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<BingoBoardMessage>, I>>(object: I): BingoBoardMessage {
    const message = createBaseBingoBoardMessage();
    message.squares = object.squares?.map((e) => PositionedBingoSquare.fromPartial(e)) || [];
    message.size = object.size ?? 0;
    message.lockout = object.lockout ?? false;
    return message;
  },
};

messageTypeRegistry.set(BingoBoardMessage.$type, BingoBoardMessage);

function createBaseSyncBoardMessage(): SyncBoardMessage {
  return { $type: "RandoProto.SyncBoardMessage", board: undefined, replace: false };
}

export const SyncBoardMessage = {
  $type: "RandoProto.SyncBoardMessage" as const,

  encode(message: SyncBoardMessage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.board !== undefined) {
      BingoBoardMessage.encode(message.board, writer.uint32(10).fork()).ldelim();
    }
    if (message.replace === true) {
      writer.uint32(16).bool(message.replace);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SyncBoardMessage {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSyncBoardMessage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.board = BingoBoardMessage.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.replace = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): SyncBoardMessage {
    return {
      $type: SyncBoardMessage.$type,
      board: isSet(object.board) ? BingoBoardMessage.fromJSON(object.board) : undefined,
      replace: isSet(object.replace) ? Boolean(object.replace) : false,
    };
  },

  toJSON(message: SyncBoardMessage): unknown {
    const obj: any = {};
    if (message.board !== undefined) {
      obj.board = BingoBoardMessage.toJSON(message.board);
    }
    if (message.replace === true) {
      obj.replace = message.replace;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<SyncBoardMessage>, I>>(base?: I): SyncBoardMessage {
    return SyncBoardMessage.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<SyncBoardMessage>, I>>(object: I): SyncBoardMessage {
    const message = createBaseSyncBoardMessage();
    message.board = (object.board !== undefined && object.board !== null)
      ? BingoBoardMessage.fromPartial(object.board)
      : undefined;
    message.replace = object.replace ?? false;
    return message;
  },
};

messageTypeRegistry.set(SyncBoardMessage.$type, SyncBoardMessage);

function createBaseAuthenticateMessage(): AuthenticateMessage {
  return { $type: "RandoProto.AuthenticateMessage", jwt: "" };
}

export const AuthenticateMessage = {
  $type: "RandoProto.AuthenticateMessage" as const,

  encode(message: AuthenticateMessage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.jwt !== "") {
      writer.uint32(10).string(message.jwt);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AuthenticateMessage {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAuthenticateMessage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.jwt = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): AuthenticateMessage {
    return { $type: AuthenticateMessage.$type, jwt: isSet(object.jwt) ? String(object.jwt) : "" };
  },

  toJSON(message: AuthenticateMessage): unknown {
    const obj: any = {};
    if (message.jwt !== "") {
      obj.jwt = message.jwt;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<AuthenticateMessage>, I>>(base?: I): AuthenticateMessage {
    return AuthenticateMessage.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<AuthenticateMessage>, I>>(object: I): AuthenticateMessage {
    const message = createBaseAuthenticateMessage();
    message.jwt = object.jwt ?? "";
    return message;
  },
};

messageTypeRegistry.set(AuthenticateMessage.$type, AuthenticateMessage);

function createBaseAuthenticatedMessage(): AuthenticatedMessage {
  return { $type: "RandoProto.AuthenticatedMessage", user: undefined, udpId: 0, udpKey: new Uint8Array(0) };
}

export const AuthenticatedMessage = {
  $type: "RandoProto.AuthenticatedMessage" as const,

  encode(message: AuthenticatedMessage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.user !== undefined) {
      UserInfo.encode(message.user, writer.uint32(10).fork()).ldelim();
    }
    if (message.udpId !== 0) {
      writer.uint32(16).int32(message.udpId);
    }
    if (message.udpKey.length !== 0) {
      writer.uint32(26).bytes(message.udpKey);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AuthenticatedMessage {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAuthenticatedMessage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.user = UserInfo.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.udpId = reader.int32();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.udpKey = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): AuthenticatedMessage {
    return {
      $type: AuthenticatedMessage.$type,
      user: isSet(object.user) ? UserInfo.fromJSON(object.user) : undefined,
      udpId: isSet(object.udpId) ? Number(object.udpId) : 0,
      udpKey: isSet(object.udpKey) ? bytesFromBase64(object.udpKey) : new Uint8Array(0),
    };
  },

  toJSON(message: AuthenticatedMessage): unknown {
    const obj: any = {};
    if (message.user !== undefined) {
      obj.user = UserInfo.toJSON(message.user);
    }
    if (message.udpId !== 0) {
      obj.udpId = Math.round(message.udpId);
    }
    if (message.udpKey.length !== 0) {
      obj.udpKey = base64FromBytes(message.udpKey);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<AuthenticatedMessage>, I>>(base?: I): AuthenticatedMessage {
    return AuthenticatedMessage.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<AuthenticatedMessage>, I>>(object: I): AuthenticatedMessage {
    const message = createBaseAuthenticatedMessage();
    message.user = (object.user !== undefined && object.user !== null) ? UserInfo.fromPartial(object.user) : undefined;
    message.udpId = object.udpId ?? 0;
    message.udpKey = object.udpKey ?? new Uint8Array(0);
    return message;
  },
};

messageTypeRegistry.set(AuthenticatedMessage.$type, AuthenticatedMessage);

function createBasePlayerPositionMessage(): PlayerPositionMessage {
  return { $type: "RandoProto.PlayerPositionMessage", x: 0, y: 0 };
}

export const PlayerPositionMessage = {
  $type: "RandoProto.PlayerPositionMessage" as const,

  encode(message: PlayerPositionMessage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.x !== 0) {
      writer.uint32(13).float(message.x);
    }
    if (message.y !== 0) {
      writer.uint32(21).float(message.y);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PlayerPositionMessage {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePlayerPositionMessage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 13) {
            break;
          }

          message.x = reader.float();
          continue;
        case 2:
          if (tag !== 21) {
            break;
          }

          message.y = reader.float();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): PlayerPositionMessage {
    return {
      $type: PlayerPositionMessage.$type,
      x: isSet(object.x) ? Number(object.x) : 0,
      y: isSet(object.y) ? Number(object.y) : 0,
    };
  },

  toJSON(message: PlayerPositionMessage): unknown {
    const obj: any = {};
    if (message.x !== 0) {
      obj.x = message.x;
    }
    if (message.y !== 0) {
      obj.y = message.y;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<PlayerPositionMessage>, I>>(base?: I): PlayerPositionMessage {
    return PlayerPositionMessage.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<PlayerPositionMessage>, I>>(object: I): PlayerPositionMessage {
    const message = createBasePlayerPositionMessage();
    message.x = object.x ?? 0;
    message.y = object.y ?? 0;
    return message;
  },
};

messageTypeRegistry.set(PlayerPositionMessage.$type, PlayerPositionMessage);

function createBaseUpdatePlayerPositionMessage(): UpdatePlayerPositionMessage {
  return { $type: "RandoProto.UpdatePlayerPositionMessage", playerId: "", x: 0, y: 0 };
}

export const UpdatePlayerPositionMessage = {
  $type: "RandoProto.UpdatePlayerPositionMessage" as const,

  encode(message: UpdatePlayerPositionMessage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.playerId !== "") {
      writer.uint32(10).string(message.playerId);
    }
    if (message.x !== 0) {
      writer.uint32(21).float(message.x);
    }
    if (message.y !== 0) {
      writer.uint32(29).float(message.y);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UpdatePlayerPositionMessage {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdatePlayerPositionMessage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.playerId = reader.string();
          continue;
        case 2:
          if (tag !== 21) {
            break;
          }

          message.x = reader.float();
          continue;
        case 3:
          if (tag !== 29) {
            break;
          }

          message.y = reader.float();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): UpdatePlayerPositionMessage {
    return {
      $type: UpdatePlayerPositionMessage.$type,
      playerId: isSet(object.playerId) ? String(object.playerId) : "",
      x: isSet(object.x) ? Number(object.x) : 0,
      y: isSet(object.y) ? Number(object.y) : 0,
    };
  },

  toJSON(message: UpdatePlayerPositionMessage): unknown {
    const obj: any = {};
    if (message.playerId !== "") {
      obj.playerId = message.playerId;
    }
    if (message.x !== 0) {
      obj.x = message.x;
    }
    if (message.y !== 0) {
      obj.y = message.y;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<UpdatePlayerPositionMessage>, I>>(base?: I): UpdatePlayerPositionMessage {
    return UpdatePlayerPositionMessage.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<UpdatePlayerPositionMessage>, I>>(object: I): UpdatePlayerPositionMessage {
    const message = createBaseUpdatePlayerPositionMessage();
    message.playerId = object.playerId ?? "";
    message.x = object.x ?? 0;
    message.y = object.y ?? 0;
    return message;
  },
};

messageTypeRegistry.set(UpdatePlayerPositionMessage.$type, UpdatePlayerPositionMessage);

function createBaseUdpPacket(): UdpPacket {
  return { $type: "RandoProto.UdpPacket", udpId: 0, encryptedPacket: new Uint8Array(0) };
}

export const UdpPacket = {
  $type: "RandoProto.UdpPacket" as const,

  encode(message: UdpPacket, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.udpId !== 0) {
      writer.uint32(8).int32(message.udpId);
    }
    if (message.encryptedPacket.length !== 0) {
      writer.uint32(18).bytes(message.encryptedPacket);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UdpPacket {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUdpPacket();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.udpId = reader.int32();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.encryptedPacket = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): UdpPacket {
    return {
      $type: UdpPacket.$type,
      udpId: isSet(object.udpId) ? Number(object.udpId) : 0,
      encryptedPacket: isSet(object.encryptedPacket) ? bytesFromBase64(object.encryptedPacket) : new Uint8Array(0),
    };
  },

  toJSON(message: UdpPacket): unknown {
    const obj: any = {};
    if (message.udpId !== 0) {
      obj.udpId = Math.round(message.udpId);
    }
    if (message.encryptedPacket.length !== 0) {
      obj.encryptedPacket = base64FromBytes(message.encryptedPacket);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<UdpPacket>, I>>(base?: I): UdpPacket {
    return UdpPacket.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<UdpPacket>, I>>(object: I): UdpPacket {
    const message = createBaseUdpPacket();
    message.udpId = object.udpId ?? 0;
    message.encryptedPacket = object.encryptedPacket ?? new Uint8Array(0);
    return message;
  },
};

messageTypeRegistry.set(UdpPacket.$type, UdpPacket);

function createBaseTrackerUpdate(): TrackerUpdate {
  return { $type: "RandoProto.TrackerUpdate", id: "", value: 0 };
}

export const TrackerUpdate = {
  $type: "RandoProto.TrackerUpdate" as const,

  encode(message: TrackerUpdate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.value !== 0) {
      writer.uint32(16).int32(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TrackerUpdate {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTrackerUpdate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.value = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): TrackerUpdate {
    return {
      $type: TrackerUpdate.$type,
      id: isSet(object.id) ? String(object.id) : "",
      value: isSet(object.value) ? Number(object.value) : 0,
    };
  },

  toJSON(message: TrackerUpdate): unknown {
    const obj: any = {};
    if (message.id !== "") {
      obj.id = message.id;
    }
    if (message.value !== 0) {
      obj.value = Math.round(message.value);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<TrackerUpdate>, I>>(base?: I): TrackerUpdate {
    return TrackerUpdate.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<TrackerUpdate>, I>>(object: I): TrackerUpdate {
    const message = createBaseTrackerUpdate();
    message.id = object.id ?? "";
    message.value = object.value ?? 0;
    return message;
  },
};

messageTypeRegistry.set(TrackerUpdate.$type, TrackerUpdate);

function createBaseResetTracker(): ResetTracker {
  return { $type: "RandoProto.ResetTracker" };
}

export const ResetTracker = {
  $type: "RandoProto.ResetTracker" as const,

  encode(_: ResetTracker, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ResetTracker {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseResetTracker();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): ResetTracker {
    return { $type: ResetTracker.$type };
  },

  toJSON(_: ResetTracker): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<ResetTracker>, I>>(base?: I): ResetTracker {
    return ResetTracker.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<ResetTracker>, I>>(_: I): ResetTracker {
    const message = createBaseResetTracker();
    return message;
  },
};

messageTypeRegistry.set(ResetTracker.$type, ResetTracker);

function createBaseTrackerFlagsUpdate(): TrackerFlagsUpdate {
  return { $type: "RandoProto.TrackerFlagsUpdate", flags: [] };
}

export const TrackerFlagsUpdate = {
  $type: "RandoProto.TrackerFlagsUpdate" as const,

  encode(message: TrackerFlagsUpdate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.flags) {
      writer.uint32(10).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TrackerFlagsUpdate {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTrackerFlagsUpdate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.flags.push(reader.string());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): TrackerFlagsUpdate {
    return {
      $type: TrackerFlagsUpdate.$type,
      flags: Array.isArray(object?.flags) ? object.flags.map((e: any) => String(e)) : [],
    };
  },

  toJSON(message: TrackerFlagsUpdate): unknown {
    const obj: any = {};
    if (message.flags?.length) {
      obj.flags = message.flags;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<TrackerFlagsUpdate>, I>>(base?: I): TrackerFlagsUpdate {
    return TrackerFlagsUpdate.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<TrackerFlagsUpdate>, I>>(object: I): TrackerFlagsUpdate {
    const message = createBaseTrackerFlagsUpdate();
    message.flags = object.flags?.map((e) => e) || [];
    return message;
  },
};

messageTypeRegistry.set(TrackerFlagsUpdate.$type, TrackerFlagsUpdate);

function createBaseRequestFullUpdate(): RequestFullUpdate {
  return { $type: "RandoProto.RequestFullUpdate" };
}

export const RequestFullUpdate = {
  $type: "RandoProto.RequestFullUpdate" as const,

  encode(_: RequestFullUpdate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RequestFullUpdate {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRequestFullUpdate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): RequestFullUpdate {
    return { $type: RequestFullUpdate.$type };
  },

  toJSON(_: RequestFullUpdate): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<RequestFullUpdate>, I>>(base?: I): RequestFullUpdate {
    return RequestFullUpdate.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<RequestFullUpdate>, I>>(_: I): RequestFullUpdate {
    const message = createBaseRequestFullUpdate();
    return message;
  },
};

messageTypeRegistry.set(RequestFullUpdate.$type, RequestFullUpdate);

function createBaseSetTrackerEndpointId(): SetTrackerEndpointId {
  return { $type: "RandoProto.SetTrackerEndpointId", endpointId: "" };
}

export const SetTrackerEndpointId = {
  $type: "RandoProto.SetTrackerEndpointId" as const,

  encode(message: SetTrackerEndpointId, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.endpointId !== "") {
      writer.uint32(10).string(message.endpointId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SetTrackerEndpointId {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSetTrackerEndpointId();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.endpointId = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): SetTrackerEndpointId {
    return { $type: SetTrackerEndpointId.$type, endpointId: isSet(object.endpointId) ? String(object.endpointId) : "" };
  },

  toJSON(message: SetTrackerEndpointId): unknown {
    const obj: any = {};
    if (message.endpointId !== "") {
      obj.endpointId = message.endpointId;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<SetTrackerEndpointId>, I>>(base?: I): SetTrackerEndpointId {
    return SetTrackerEndpointId.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<SetTrackerEndpointId>, I>>(object: I): SetTrackerEndpointId {
    const message = createBaseSetTrackerEndpointId();
    message.endpointId = object.endpointId ?? "";
    return message;
  },
};

messageTypeRegistry.set(SetTrackerEndpointId.$type, SetTrackerEndpointId);

function createBaseTrackerTimerStateUpdate(): TrackerTimerStateUpdate {
  return { $type: "RandoProto.TrackerTimerStateUpdate", totalTime: 0, loadingTime: 0, timerShouldRun: false };
}

export const TrackerTimerStateUpdate = {
  $type: "RandoProto.TrackerTimerStateUpdate" as const,

  encode(message: TrackerTimerStateUpdate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.totalTime !== 0) {
      writer.uint32(13).float(message.totalTime);
    }
    if (message.loadingTime !== 0) {
      writer.uint32(21).float(message.loadingTime);
    }
    if (message.timerShouldRun === true) {
      writer.uint32(24).bool(message.timerShouldRun);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TrackerTimerStateUpdate {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTrackerTimerStateUpdate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 13) {
            break;
          }

          message.totalTime = reader.float();
          continue;
        case 2:
          if (tag !== 21) {
            break;
          }

          message.loadingTime = reader.float();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.timerShouldRun = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): TrackerTimerStateUpdate {
    return {
      $type: TrackerTimerStateUpdate.$type,
      totalTime: isSet(object.totalTime) ? Number(object.totalTime) : 0,
      loadingTime: isSet(object.loadingTime) ? Number(object.loadingTime) : 0,
      timerShouldRun: isSet(object.timerShouldRun) ? Boolean(object.timerShouldRun) : false,
    };
  },

  toJSON(message: TrackerTimerStateUpdate): unknown {
    const obj: any = {};
    if (message.totalTime !== 0) {
      obj.totalTime = message.totalTime;
    }
    if (message.loadingTime !== 0) {
      obj.loadingTime = message.loadingTime;
    }
    if (message.timerShouldRun === true) {
      obj.timerShouldRun = message.timerShouldRun;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<TrackerTimerStateUpdate>, I>>(base?: I): TrackerTimerStateUpdate {
    return TrackerTimerStateUpdate.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<TrackerTimerStateUpdate>, I>>(object: I): TrackerTimerStateUpdate {
    const message = createBaseTrackerTimerStateUpdate();
    message.totalTime = object.totalTime ?? 0;
    message.loadingTime = object.loadingTime ?? 0;
    message.timerShouldRun = object.timerShouldRun ?? false;
    return message;
  },
};

messageTypeRegistry.set(TrackerTimerStateUpdate.$type, TrackerTimerStateUpdate);

function createBaseNormalGameHandlerState(): NormalGameHandlerState {
  return {
    $type: "RandoProto.NormalGameHandlerState",
    raceStartingAt: undefined,
    finishedTime: undefined,
    playerLoadingTimes: {},
    playerFinishedTimes: {},
    worldFinishedTimes: {},
    universeFinishedTimes: {},
    raceModeEnabled: false,
    raceStarted: false,
  };
}

export const NormalGameHandlerState = {
  $type: "RandoProto.NormalGameHandlerState" as const,

  encode(message: NormalGameHandlerState, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.raceStartingAt !== undefined) {
      writer.uint32(8).int64(message.raceStartingAt);
    }
    if (message.finishedTime !== undefined) {
      writer.uint32(21).float(message.finishedTime);
    }
    Object.entries(message.playerLoadingTimes).forEach(([key, value]) => {
      NormalGameHandlerState_PlayerLoadingTimesEntry.encode({
        $type: "RandoProto.NormalGameHandlerState.PlayerLoadingTimesEntry",
        key: key as any,
        value,
      }, writer.uint32(26).fork()).ldelim();
    });
    Object.entries(message.playerFinishedTimes).forEach(([key, value]) => {
      NormalGameHandlerState_PlayerFinishedTimesEntry.encode({
        $type: "RandoProto.NormalGameHandlerState.PlayerFinishedTimesEntry",
        key: key as any,
        value,
      }, writer.uint32(34).fork()).ldelim();
    });
    Object.entries(message.worldFinishedTimes).forEach(([key, value]) => {
      NormalGameHandlerState_WorldFinishedTimesEntry.encode({
        $type: "RandoProto.NormalGameHandlerState.WorldFinishedTimesEntry",
        key: key as any,
        value,
      }, writer.uint32(42).fork()).ldelim();
    });
    Object.entries(message.universeFinishedTimes).forEach(([key, value]) => {
      NormalGameHandlerState_UniverseFinishedTimesEntry.encode({
        $type: "RandoProto.NormalGameHandlerState.UniverseFinishedTimesEntry",
        key: key as any,
        value,
      }, writer.uint32(50).fork()).ldelim();
    });
    if (message.raceModeEnabled === true) {
      writer.uint32(56).bool(message.raceModeEnabled);
    }
    if (message.raceStarted === true) {
      writer.uint32(64).bool(message.raceStarted);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NormalGameHandlerState {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNormalGameHandlerState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.raceStartingAt = longToNumber(reader.int64() as Long);
          continue;
        case 2:
          if (tag !== 21) {
            break;
          }

          message.finishedTime = reader.float();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          const entry3 = NormalGameHandlerState_PlayerLoadingTimesEntry.decode(reader, reader.uint32());
          if (entry3.value !== undefined) {
            message.playerLoadingTimes[entry3.key] = entry3.value;
          }
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          const entry4 = NormalGameHandlerState_PlayerFinishedTimesEntry.decode(reader, reader.uint32());
          if (entry4.value !== undefined) {
            message.playerFinishedTimes[entry4.key] = entry4.value;
          }
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          const entry5 = NormalGameHandlerState_WorldFinishedTimesEntry.decode(reader, reader.uint32());
          if (entry5.value !== undefined) {
            message.worldFinishedTimes[entry5.key] = entry5.value;
          }
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          const entry6 = NormalGameHandlerState_UniverseFinishedTimesEntry.decode(reader, reader.uint32());
          if (entry6.value !== undefined) {
            message.universeFinishedTimes[entry6.key] = entry6.value;
          }
          continue;
        case 7:
          if (tag !== 56) {
            break;
          }

          message.raceModeEnabled = reader.bool();
          continue;
        case 8:
          if (tag !== 64) {
            break;
          }

          message.raceStarted = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): NormalGameHandlerState {
    return {
      $type: NormalGameHandlerState.$type,
      raceStartingAt: isSet(object.raceStartingAt) ? Number(object.raceStartingAt) : undefined,
      finishedTime: isSet(object.finishedTime) ? Number(object.finishedTime) : undefined,
      playerLoadingTimes: isObject(object.playerLoadingTimes)
        ? Object.entries(object.playerLoadingTimes).reduce<{ [key: string]: number }>((acc, [key, value]) => {
          acc[key] = Number(value);
          return acc;
        }, {})
        : {},
      playerFinishedTimes: isObject(object.playerFinishedTimes)
        ? Object.entries(object.playerFinishedTimes).reduce<{ [key: string]: number }>((acc, [key, value]) => {
          acc[key] = Number(value);
          return acc;
        }, {})
        : {},
      worldFinishedTimes: isObject(object.worldFinishedTimes)
        ? Object.entries(object.worldFinishedTimes).reduce<{ [key: number]: number }>((acc, [key, value]) => {
          acc[Number(key)] = Number(value);
          return acc;
        }, {})
        : {},
      universeFinishedTimes: isObject(object.universeFinishedTimes)
        ? Object.entries(object.universeFinishedTimes).reduce<{ [key: number]: number }>((acc, [key, value]) => {
          acc[Number(key)] = Number(value);
          return acc;
        }, {})
        : {},
      raceModeEnabled: isSet(object.raceModeEnabled) ? Boolean(object.raceModeEnabled) : false,
      raceStarted: isSet(object.raceStarted) ? Boolean(object.raceStarted) : false,
    };
  },

  toJSON(message: NormalGameHandlerState): unknown {
    const obj: any = {};
    if (message.raceStartingAt !== undefined) {
      obj.raceStartingAt = Math.round(message.raceStartingAt);
    }
    if (message.finishedTime !== undefined) {
      obj.finishedTime = message.finishedTime;
    }
    if (message.playerLoadingTimes) {
      const entries = Object.entries(message.playerLoadingTimes);
      if (entries.length > 0) {
        obj.playerLoadingTimes = {};
        entries.forEach(([k, v]) => {
          obj.playerLoadingTimes[k] = v;
        });
      }
    }
    if (message.playerFinishedTimes) {
      const entries = Object.entries(message.playerFinishedTimes);
      if (entries.length > 0) {
        obj.playerFinishedTimes = {};
        entries.forEach(([k, v]) => {
          obj.playerFinishedTimes[k] = v;
        });
      }
    }
    if (message.worldFinishedTimes) {
      const entries = Object.entries(message.worldFinishedTimes);
      if (entries.length > 0) {
        obj.worldFinishedTimes = {};
        entries.forEach(([k, v]) => {
          obj.worldFinishedTimes[k] = v;
        });
      }
    }
    if (message.universeFinishedTimes) {
      const entries = Object.entries(message.universeFinishedTimes);
      if (entries.length > 0) {
        obj.universeFinishedTimes = {};
        entries.forEach(([k, v]) => {
          obj.universeFinishedTimes[k] = v;
        });
      }
    }
    if (message.raceModeEnabled === true) {
      obj.raceModeEnabled = message.raceModeEnabled;
    }
    if (message.raceStarted === true) {
      obj.raceStarted = message.raceStarted;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<NormalGameHandlerState>, I>>(base?: I): NormalGameHandlerState {
    return NormalGameHandlerState.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<NormalGameHandlerState>, I>>(object: I): NormalGameHandlerState {
    const message = createBaseNormalGameHandlerState();
    message.raceStartingAt = object.raceStartingAt ?? undefined;
    message.finishedTime = object.finishedTime ?? undefined;
    message.playerLoadingTimes = Object.entries(object.playerLoadingTimes ?? {}).reduce<{ [key: string]: number }>(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = Number(value);
        }
        return acc;
      },
      {},
    );
    message.playerFinishedTimes = Object.entries(object.playerFinishedTimes ?? {}).reduce<{ [key: string]: number }>(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = Number(value);
        }
        return acc;
      },
      {},
    );
    message.worldFinishedTimes = Object.entries(object.worldFinishedTimes ?? {}).reduce<{ [key: number]: number }>(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[Number(key)] = Number(value);
        }
        return acc;
      },
      {},
    );
    message.universeFinishedTimes = Object.entries(object.universeFinishedTimes ?? {}).reduce<
      { [key: number]: number }
    >((acc, [key, value]) => {
      if (value !== undefined) {
        acc[Number(key)] = Number(value);
      }
      return acc;
    }, {});
    message.raceModeEnabled = object.raceModeEnabled ?? false;
    message.raceStarted = object.raceStarted ?? false;
    return message;
  },
};

messageTypeRegistry.set(NormalGameHandlerState.$type, NormalGameHandlerState);

function createBaseNormalGameHandlerState_PlayerLoadingTimesEntry(): NormalGameHandlerState_PlayerLoadingTimesEntry {
  return { $type: "RandoProto.NormalGameHandlerState.PlayerLoadingTimesEntry", key: "", value: 0 };
}

export const NormalGameHandlerState_PlayerLoadingTimesEntry = {
  $type: "RandoProto.NormalGameHandlerState.PlayerLoadingTimesEntry" as const,

  encode(
    message: NormalGameHandlerState_PlayerLoadingTimesEntry,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== 0) {
      writer.uint32(21).float(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NormalGameHandlerState_PlayerLoadingTimesEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNormalGameHandlerState_PlayerLoadingTimesEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.key = reader.string();
          continue;
        case 2:
          if (tag !== 21) {
            break;
          }

          message.value = reader.float();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): NormalGameHandlerState_PlayerLoadingTimesEntry {
    return {
      $type: NormalGameHandlerState_PlayerLoadingTimesEntry.$type,
      key: isSet(object.key) ? String(object.key) : "",
      value: isSet(object.value) ? Number(object.value) : 0,
    };
  },

  toJSON(message: NormalGameHandlerState_PlayerLoadingTimesEntry): unknown {
    const obj: any = {};
    if (message.key !== "") {
      obj.key = message.key;
    }
    if (message.value !== 0) {
      obj.value = message.value;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<NormalGameHandlerState_PlayerLoadingTimesEntry>, I>>(
    base?: I,
  ): NormalGameHandlerState_PlayerLoadingTimesEntry {
    return NormalGameHandlerState_PlayerLoadingTimesEntry.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<NormalGameHandlerState_PlayerLoadingTimesEntry>, I>>(
    object: I,
  ): NormalGameHandlerState_PlayerLoadingTimesEntry {
    const message = createBaseNormalGameHandlerState_PlayerLoadingTimesEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? 0;
    return message;
  },
};

messageTypeRegistry.set(
  NormalGameHandlerState_PlayerLoadingTimesEntry.$type,
  NormalGameHandlerState_PlayerLoadingTimesEntry,
);

function createBaseNormalGameHandlerState_PlayerFinishedTimesEntry(): NormalGameHandlerState_PlayerFinishedTimesEntry {
  return { $type: "RandoProto.NormalGameHandlerState.PlayerFinishedTimesEntry", key: "", value: 0 };
}

export const NormalGameHandlerState_PlayerFinishedTimesEntry = {
  $type: "RandoProto.NormalGameHandlerState.PlayerFinishedTimesEntry" as const,

  encode(
    message: NormalGameHandlerState_PlayerFinishedTimesEntry,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== 0) {
      writer.uint32(21).float(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NormalGameHandlerState_PlayerFinishedTimesEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNormalGameHandlerState_PlayerFinishedTimesEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.key = reader.string();
          continue;
        case 2:
          if (tag !== 21) {
            break;
          }

          message.value = reader.float();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): NormalGameHandlerState_PlayerFinishedTimesEntry {
    return {
      $type: NormalGameHandlerState_PlayerFinishedTimesEntry.$type,
      key: isSet(object.key) ? String(object.key) : "",
      value: isSet(object.value) ? Number(object.value) : 0,
    };
  },

  toJSON(message: NormalGameHandlerState_PlayerFinishedTimesEntry): unknown {
    const obj: any = {};
    if (message.key !== "") {
      obj.key = message.key;
    }
    if (message.value !== 0) {
      obj.value = message.value;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<NormalGameHandlerState_PlayerFinishedTimesEntry>, I>>(
    base?: I,
  ): NormalGameHandlerState_PlayerFinishedTimesEntry {
    return NormalGameHandlerState_PlayerFinishedTimesEntry.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<NormalGameHandlerState_PlayerFinishedTimesEntry>, I>>(
    object: I,
  ): NormalGameHandlerState_PlayerFinishedTimesEntry {
    const message = createBaseNormalGameHandlerState_PlayerFinishedTimesEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? 0;
    return message;
  },
};

messageTypeRegistry.set(
  NormalGameHandlerState_PlayerFinishedTimesEntry.$type,
  NormalGameHandlerState_PlayerFinishedTimesEntry,
);

function createBaseNormalGameHandlerState_WorldFinishedTimesEntry(): NormalGameHandlerState_WorldFinishedTimesEntry {
  return { $type: "RandoProto.NormalGameHandlerState.WorldFinishedTimesEntry", key: 0, value: 0 };
}

export const NormalGameHandlerState_WorldFinishedTimesEntry = {
  $type: "RandoProto.NormalGameHandlerState.WorldFinishedTimesEntry" as const,

  encode(
    message: NormalGameHandlerState_WorldFinishedTimesEntry,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.key !== 0) {
      writer.uint32(8).int64(message.key);
    }
    if (message.value !== 0) {
      writer.uint32(21).float(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NormalGameHandlerState_WorldFinishedTimesEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNormalGameHandlerState_WorldFinishedTimesEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.key = longToNumber(reader.int64() as Long);
          continue;
        case 2:
          if (tag !== 21) {
            break;
          }

          message.value = reader.float();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): NormalGameHandlerState_WorldFinishedTimesEntry {
    return {
      $type: NormalGameHandlerState_WorldFinishedTimesEntry.$type,
      key: isSet(object.key) ? Number(object.key) : 0,
      value: isSet(object.value) ? Number(object.value) : 0,
    };
  },

  toJSON(message: NormalGameHandlerState_WorldFinishedTimesEntry): unknown {
    const obj: any = {};
    if (message.key !== 0) {
      obj.key = Math.round(message.key);
    }
    if (message.value !== 0) {
      obj.value = message.value;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<NormalGameHandlerState_WorldFinishedTimesEntry>, I>>(
    base?: I,
  ): NormalGameHandlerState_WorldFinishedTimesEntry {
    return NormalGameHandlerState_WorldFinishedTimesEntry.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<NormalGameHandlerState_WorldFinishedTimesEntry>, I>>(
    object: I,
  ): NormalGameHandlerState_WorldFinishedTimesEntry {
    const message = createBaseNormalGameHandlerState_WorldFinishedTimesEntry();
    message.key = object.key ?? 0;
    message.value = object.value ?? 0;
    return message;
  },
};

messageTypeRegistry.set(
  NormalGameHandlerState_WorldFinishedTimesEntry.$type,
  NormalGameHandlerState_WorldFinishedTimesEntry,
);

function createBaseNormalGameHandlerState_UniverseFinishedTimesEntry(): NormalGameHandlerState_UniverseFinishedTimesEntry {
  return { $type: "RandoProto.NormalGameHandlerState.UniverseFinishedTimesEntry", key: 0, value: 0 };
}

export const NormalGameHandlerState_UniverseFinishedTimesEntry = {
  $type: "RandoProto.NormalGameHandlerState.UniverseFinishedTimesEntry" as const,

  encode(
    message: NormalGameHandlerState_UniverseFinishedTimesEntry,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.key !== 0) {
      writer.uint32(8).int64(message.key);
    }
    if (message.value !== 0) {
      writer.uint32(21).float(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NormalGameHandlerState_UniverseFinishedTimesEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNormalGameHandlerState_UniverseFinishedTimesEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.key = longToNumber(reader.int64() as Long);
          continue;
        case 2:
          if (tag !== 21) {
            break;
          }

          message.value = reader.float();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): NormalGameHandlerState_UniverseFinishedTimesEntry {
    return {
      $type: NormalGameHandlerState_UniverseFinishedTimesEntry.$type,
      key: isSet(object.key) ? Number(object.key) : 0,
      value: isSet(object.value) ? Number(object.value) : 0,
    };
  },

  toJSON(message: NormalGameHandlerState_UniverseFinishedTimesEntry): unknown {
    const obj: any = {};
    if (message.key !== 0) {
      obj.key = Math.round(message.key);
    }
    if (message.value !== 0) {
      obj.value = message.value;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<NormalGameHandlerState_UniverseFinishedTimesEntry>, I>>(
    base?: I,
  ): NormalGameHandlerState_UniverseFinishedTimesEntry {
    return NormalGameHandlerState_UniverseFinishedTimesEntry.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<NormalGameHandlerState_UniverseFinishedTimesEntry>, I>>(
    object: I,
  ): NormalGameHandlerState_UniverseFinishedTimesEntry {
    const message = createBaseNormalGameHandlerState_UniverseFinishedTimesEntry();
    message.key = object.key ?? 0;
    message.value = object.value ?? 0;
    return message;
  },
};

messageTypeRegistry.set(
  NormalGameHandlerState_UniverseFinishedTimesEntry.$type,
  NormalGameHandlerState_UniverseFinishedTimesEntry,
);

declare const self: any | undefined;
declare const window: any | undefined;
declare const global: any | undefined;
const tsProtoGlobalThis: any = (() => {
  if (typeof globalThis !== "undefined") {
    return globalThis;
  }
  if (typeof self !== "undefined") {
    return self;
  }
  if (typeof window !== "undefined") {
    return window;
  }
  if (typeof global !== "undefined") {
    return global;
  }
  throw "Unable to locate global object";
})();

function bytesFromBase64(b64: string): Uint8Array {
  if (tsProtoGlobalThis.Buffer) {
    return Uint8Array.from(tsProtoGlobalThis.Buffer.from(b64, "base64"));
  } else {
    const bin = tsProtoGlobalThis.atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; ++i) {
      arr[i] = bin.charCodeAt(i);
    }
    return arr;
  }
}

function base64FromBytes(arr: Uint8Array): string {
  if (tsProtoGlobalThis.Buffer) {
    return tsProtoGlobalThis.Buffer.from(arr).toString("base64");
  } else {
    const bin: string[] = [];
    arr.forEach((byte) => {
      bin.push(String.fromCharCode(byte));
    });
    return tsProtoGlobalThis.btoa(bin.join(""));
  }
}

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in Exclude<keyof T, "$type">]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P> | "$type">]: never };

function longToNumber(long: Long): number {
  if (long.gt(Number.MAX_SAFE_INTEGER)) {
    throw new tsProtoGlobalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
  }
  return long.toNumber();
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isObject(value: any): boolean {
  return typeof value === "object" && value !== null;
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
