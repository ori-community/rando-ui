import {UserInfo} from "./user"

export type LeagueSeasonInfo = {
  id: number,
  name: string,
  memberships: LeagueSeasonMembershipInfo[],
  gameCount: number,
  games: LeagueGameInfo[],
  canJoin: boolean,
  currentGameId: number | null,
  shortDescription: string,
  longDescriptionMarkdown: string,
  rulesMarkdown: string,
  nextContinuationAt: number,
  backgroundImageUrl: string | null,
  discardWorstGamesCount: number,
}

export type LeagueGameInfo = {
  id: number,
  multiverseId: number,
  seasonId: number,
  submissionCount: number,
  gameNumber: number,
  isCurrent: boolean,
  userMetadata: LeagueGameUserMetadataInfo | null,
}

export type  LeagueSeasonMembershipInfo = {
  user: UserInfo,
  points: number,
  rank: number | null,
  lastRankDelta: number | null,
  joinedAt: number,
  rankingCompensationPoints: number,
}

export type LeagueGameUserMetadataInfo = {
  canSubmit: boolean,
  ownSubmission: LeagueGameSubmissionInfo | null,
}

export type LeagueGameSubmissionInfo = {
  id: number,
  membership: LeagueSeasonMembershipInfo,
  submittedAt: number,
  rankingData: LeagueGameSubmissionRankingDataInfo | null,
  hasSaveFile: boolean,
}

export type LeagueGameSubmissionRankingDataInfo = {
  time: number | null,
  points: number,
  rank: number | null,
  videoUrl: string | null,
  rankingMultiplier: number,
  originalTime: number | null,
}
