import { describe, expect, it } from 'vitest';
import { NODE_DEFINITIONS } from '../data/nodes';
import { pickNextNode, resolveNodeRewards, isCritWindowActive } from './nodeEngine';

describe('nodeEngine', () => {
  const baseState = { ownedToolIds: ['bronze-pick'], unlocks: {} };

  it('never spawns special nodes before unlock', () => {
    const node = pickNextNode(baseState, () => 0.01);
    expect(node.id).toBe('basalt-core');
  });

  it('spawns iron veins once iron pick is owned', () => {
    const node = pickNextNode({ ...baseState, ownedToolIds: ['bronze-pick', 'iron-pick'] }, () => 0.2);
    expect(node.id).toBe('iron-vein');
  });

  it('spawns crystal geodes only after surveyor unlock', () => {
    const withoutUnlock = pickNextNode({ ...baseState, ownedToolIds: ['bronze-pick', 'obsidian-pick'] }, () => 0.1);
    expect(withoutUnlock.id).not.toBe('crystal-geode');

    const node = pickNextNode({ ...baseState, unlocks: { surveyor: true } }, () => 0.1);
    expect(node.id).toBe('crystal-geode');
  });

  it('resolves iron vein rewards with probabilistic ingots', () => {
    const ironNode = NODE_DEFINITIONS.find((n) => n.id === 'iron-vein');
    if (!ironNode) throw new Error('missing iron node');
    const noIngot = resolveNodeRewards(ironNode, { isCrit: false }, () => 0.5);
    expect(noIngot).toEqual({ chips: 4, ingots: 0, shards: 0 });

    const ingotDrop = resolveNodeRewards(ironNode, { isCrit: false }, () => 0.05);
    expect(ingotDrop).toEqual({ chips: 4, ingots: 1, shards: 0 });
  });

  it('adds crit bonuses for crystal geodes', () => {
    const crystal = NODE_DEFINITIONS.find((n) => n.id === 'crystal-geode');
    if (!crystal) throw new Error('missing crystal node');
    const result = resolveNodeRewards(crystal, { isCrit: true }, () => 0.6);
    expect(result.shards).toBe(2);
  });

  it('detects crit window based on timestamps', () => {
    const now = Date.now();
    expect(isCritWindowActive(now - 150, now, 200)).toBe(true);
    expect(isCritWindowActive(now - 500, now, 200)).toBe(false);
  });
});
