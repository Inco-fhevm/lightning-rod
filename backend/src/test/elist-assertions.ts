import { expect } from 'vitest';

export function expectPermutation(actual: bigint[], expected: bigint[]) {
  // Identity is a valid shuffle; compare multisets, including repeated values.
  expect([...actual].sort()).toEqual([...expected].sort());
}
