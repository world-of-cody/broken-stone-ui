import { describe, expect, it, beforeEach } from 'vitest';
import { SHOP_ITEMS } from '../data/shopCatalog';
import { getToolById } from '../data/tools';
import { BASE_NODE_ID } from '../data/nodes';
import type { SessionState } from '../context/SessionState';
import {
  applyPurchase,
  computeDamageWithBoosters,
  getShopItem,
  unmetUnlockReasons,
} from './shopLogic';

let baseState: SessionState;

beforeEach(() => {
  baseState = {
    stoneHP: 80,
    stoneMaxHP: 80,
    resources: { chips: 200, ingots: 0, shards: 5 },
    equippedTool: getToolById('bronze-pick'),
    ownedToolIds: ['bronze-pick'],
    activeBoosters: [],
    activeNode: { id: BASE_NODE_ID, hp: 80 },
    unlocks: {},
    lastHitAt: null,
    lastCritAt: null,
    lastHitResult: null,
  } as SessionState;
});

describe('shopLogic helpers', () => {
  it('reports unmet unlock reasons when requirements fail', () => {
    const obsidian = SHOP_ITEMS.find((item) => item.id === 'obsidian-pick-upgrade');
    if (!obsidian) throw new Error('Missing obsidian item');
    const reasons = unmetUnlockReasons(obsidian, baseState);
    expect(reasons).toContain('Requires Iron Pickaxe');
  });

  it('applies tool purchases and equips them', () => {
    const iron = getShopItem('iron-pick-upgrade');
    if (!iron) throw new Error('Missing iron item');
    const next = applyPurchase(baseState, iron);
    expect(next.ownedToolIds).toContain('iron-pick');
    expect(next.equippedTool.id).toBe('iron-pick');
    expect(next.resources.chips).toBe(baseState.resources.chips - iron.cost[0]!.amount);
  });

  it('activates booster purchases and updates damage computation', () => {
    const booster = getShopItem('forge-booster');
    if (!booster || booster.type !== 'booster') throw new Error('Missing booster item');
    const next = applyPurchase(baseState, booster, 1000);
    expect(next.activeBoosters).toHaveLength(1);
    const damage = computeDamageWithBoosters(2, next.activeBoosters);
    expect(damage).toBe(4);
  });
});
