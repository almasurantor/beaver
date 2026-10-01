import { describe, expect, it } from 'vitest';
import { canTransitionMatch, isPotentialDuplicate, nextStreak } from './ranking-rules';

describe('ranking lifecycle rules', () => {
  it('updates winning and losing streaks', () => {
    expect(nextStreak(2, true)).toBe(3);
    expect(nextStreak(-2, true)).toBe(1);
    expect(nextStreak(-2, false)).toBe(-3);
    expect(nextStreak(3, false)).toBe(-1);
  });

  it('detects the same result within five minutes regardless of player order', () => {
    const createdAt = new Date('2026-10-01T12:00:00Z');
    expect(isPotentialDuplicate(
      { playerOneId: 'a', playerTwoId: 'b', winnerId: 'a', playerOneScore: 11, playerTwoScore: 8, createdAt },
      { playerOneId: 'b', playerTwoId: 'a', winnerId: 'a', playerOneScore: 8, playerTwoScore: 11, createdAt: new Date(createdAt.getTime() + 120_000) },
    )).toBe(true);
  });

  it('guards terminal states and required review transitions', () => {
    expect(canTransitionMatch('result_reported', 'confirmed')).toBe(true);
    expect(canTransitionMatch('correction_proposed', 'admin_review')).toBe(true);
    expect(canTransitionMatch('confirmed', 'ready')).toBe(false);
  });
});
