import type { MatchStatus } from './types';

export interface DuplicateCandidate {
  playerOneId: string;
  playerTwoId: string;
  winnerId: string;
  playerOneScore: number;
  playerTwoScore: number;
  createdAt: string | Date;
}

export function nextStreak(current: number, won: boolean): number {
  if (won) return current > 0 ? current + 1 : 1;
  return current < 0 ? current - 1 : -1;
}

export function isPotentialDuplicate(
  candidate: DuplicateCandidate,
  proposed: Omit<DuplicateCandidate, 'createdAt'> & { createdAt: string | Date },
  windowMs = 5 * 60 * 1000,
): boolean {
  const candidatePair = [candidate.playerOneId, candidate.playerTwoId].sort().join(':');
  const proposedPair = [proposed.playerOneId, proposed.playerTwoId].sort().join(':');
  const sameOrientation = candidate.playerOneId === proposed.playerOneId;
  const sameScore = sameOrientation
    ? candidate.playerOneScore === proposed.playerOneScore && candidate.playerTwoScore === proposed.playerTwoScore
    : candidate.playerOneScore === proposed.playerTwoScore && candidate.playerTwoScore === proposed.playerOneScore;
  return candidatePair === proposedPair
    && candidate.winnerId === proposed.winnerId
    && sameScore
    && Math.abs(new Date(candidate.createdAt).getTime() - new Date(proposed.createdAt).getTime()) <= windowMs;
}

const allowedTransitions: Partial<Record<MatchStatus, MatchStatus[]>> = {
  ready: ['result_reported', 'awaiting_independent_report', 'expired'],
  awaiting_independent_report: ['confirmed', 'admin_review', 'expired'],
  result_reported: ['confirmed', 'correction_proposed', 'expired'],
  correction_proposed: ['confirmed', 'admin_review', 'expired'],
  admin_review: ['confirmed', 'voided'],
};

export function canTransitionMatch(from: MatchStatus, to: MatchStatus): boolean {
  return allowedTransitions[from]?.includes(to) ?? false;
}
