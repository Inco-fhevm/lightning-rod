import { describe, expect, it } from 'vitest';
import { expectPermutation } from './elist-assertions.js';

describe('shuffle permutation assertion', () => {
  it('accepts the unchanged order', () => {
    expectPermutation([100n, 200n, 300n, 400n, 500n], [100n, 200n, 300n, 400n, 500n]);
  });

  it('accepts reordered values including duplicates', () => {
    expectPermutation([200n, 100n, 100n], [100n, 200n, 100n]);
  });

  it('rejects a missing value', () => {
    expect(() => expectPermutation([100n], [100n, 200n])).toThrow();
  });

  it('rejects a changed multiplicity even when every distinct value is present', () => {
    expect(() => expectPermutation([100n, 200n, 200n], [100n, 100n, 200n])).toThrow();
  });
});
