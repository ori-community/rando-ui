import {UserInfo as ProtoUserInfo} from "../proto/messages"

export type UserInfo = Omit<ProtoUserInfo, "$type">;
