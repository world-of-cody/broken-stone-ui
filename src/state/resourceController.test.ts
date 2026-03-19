import { describe, expect, it } from 'vitest';
import { zeroResourceDelta } from './nodeEngine';
import { updateResourceTotals } from './resourceController';

const baseResources = { chips: 0, ingots: 0, shards: 0 } as const;

describe('resourceController', () => {
  it('returns early when delta is empty', () => {
    const result = updateResourceTotals(baseResources, zeroResourceDelta());
    expect(result.changed).toBe(false);
    expect(result.unlockedResources).toHaveLength(0);
    expect(result.totals).toBe(baseResources);
  });

  it('tracks unlocked resource types', () => {
    const result = updateResourceTotals(baseResources, { chips: 4, ingots: 1, shards: 0 });
    expect(result.changed).toBe(true);
    expect(result.unlockedResources).toEqual(['chips', 'ingots']);
    expect(result.totals).toEqual({ chips: 4, ingots: 1, shards: 0 });
  });

  it('does not mark already-owned resources as unlocked', () => {
    const result = updateResourceTotals({ chips: 10, ingots: 0, shards: 1 }, { chips: 1, ingots: 0, shards: 2 });
    expect(result.unlockedResources).toEqual([]);
    expect(result.totals).toEqual({ chips: 11, ingots: 0, shards: 3 });
  });
});
