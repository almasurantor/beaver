/** Standard zero-sum ELO. Scores never influence the rating delta. */

const K_FACTOR = 32;
const BASE_ELO = 1000;

export interface EloResult {
  newRatingA: number;
  newRatingB: number;
  eloChangeA: number;
  eloChangeB: number;
}

/**
 * Calculate expected score for player A
 */
function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

/**
 * Calculate new ELO ratings after a match
 * @param ratingA Current ELO of player A
 * @param ratingB Current ELO of player B
 * @param scoreA Score of player A
 * @param scoreB Score of player B
 * @returns New ratings and changes
 */
export function calculateElo(
  ratingA: number,
  ratingB: number,
  scoreA: number,
  scoreB: number
): EloResult {
  const expectedA = expectedScore(ratingA, ratingB);
  const expectedB = 1 - expectedA;

  if (scoreA === scoreB) throw new Error('Ranked matches cannot end in a draw');
  const playerAWon = scoreA > scoreB;
  const winnerExpected = playerAWon ? expectedA : expectedB;
  const winnerChange = Math.round(K_FACTOR * (1 - winnerExpected));
  const eloChangeA = playerAWon ? winnerChange : -winnerChange;
  const eloChangeB = -eloChangeA;

  // Calculate new ratings
  const newRatingA = ratingA + eloChangeA;
  const newRatingB = ratingB + eloChangeB;

  return {
    newRatingA,
    newRatingB,
    eloChangeA,
    eloChangeB,
  };
}

export { K_FACTOR, BASE_ELO };
