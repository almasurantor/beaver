import { describe, expect, it } from 'vitest';
import { validateMatchScore } from './match-result';

describe('table-tennis score validation', () => {
  it.each([[11, 0], [11, 9], [12, 10], [21, 19]])('accepts %i–%i', (one, two) => {
    expect(validateMatchScore(one, two)).toBeNull();
  });

  it.each([[10, 8], [11, 10], [12, 9], [11, 11], [-1, 11], [100, 98], [11.5, 9]])('rejects %s–%s', (one, two) => {
    expect(validateMatchScore(one, two)).not.toBeNull();
  });
});
