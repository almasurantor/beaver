import { describe, expect, it } from 'vitest';
import { calculateElo } from './elo';

describe('standard ELO', () => {
  it('is invariant across score margins', () => {
    expect(calculateElo(1000, 1000, 11, 9)).toEqual(calculateElo(1000, 1000, 11, 0));
  });

  it('always applies exact inverse changes', () => {
    for (const [a, b] of [[1000, 1000], [1450, 900], [800, 1700]]) {
      const result = calculateElo(a, b, 11, 7);
      expect(result.eloChangeA + result.eloChangeB).toBe(0);
      expect(result.newRatingA + result.newRatingB).toBe(a + b);
    }
  });

  it('rejects tied results', () => {
    expect(() => calculateElo(1000, 1000, 11, 11)).toThrow();
  });
});
