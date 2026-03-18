import type { NodeDefinition, NodeUnlockState, ResourceType } from '../data/nodes';
import { NODE_DEFINITIONS } from '../data/nodes';

export type ResourceDelta = Record<ResourceType, number>;

const BASE_NODE_ID: NodeDefinition['id'] = 'basalt-core';

const baseNode = NODE_DEFINITIONS.find((node) => node.id === BASE_NODE_ID)!;

const zeroDelta = (): ResourceDelta => ({ chips: 0, ingots: 0, shards: 0 });

const unlockedSpecialNodes = (state: NodeUnlockState) =>
  NODE_DEFINITIONS.filter((node) => node.id !== BASE_NODE_ID && node.unlocksWhen(state)).sort(
    (a, b) => b.spawnChance - a.spawnChance
  );

export const pickNextNode = (state: NodeUnlockState, rng: () => number = Math.random): NodeDefinition => {
  const specials = unlockedSpecialNodes(state);
  for (const node of specials) {
    if (rng() <= node.spawnChance) {
      return node;
    }
  }
  return baseNode;
};

export const resolveNodeRewards = (
  node: NodeDefinition,
  { isCrit }: { isCrit: boolean },
  rng: () => number = Math.random
): ResourceDelta => {
  const delta = zeroDelta();
  node.rewards.forEach((reward) => {
    const roll = reward.chance != null ? rng() <= reward.chance : true;
    if (roll) {
      delta[reward.resource] += reward.amount;
      if (isCrit && reward.critBonus) {
        delta[reward.resource] += reward.critBonus;
      }
    }
  });
  return delta;
};

export const applyDelta = (resources: ResourceDelta, delta: ResourceDelta): ResourceDelta => ({
  chips: resources.chips + delta.chips,
  ingots: resources.ingots + delta.ingots,
  shards: resources.shards + delta.shards,
});

export const isCritWindowActive = (lastHitAt: number | null, now: number, windowMs: number) => {
  if (!lastHitAt) return false;
  return now - lastHitAt <= windowMs;
};
