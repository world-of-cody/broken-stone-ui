import type { ResourceType } from '../data/nodes';
import type { ResourceDelta } from './nodeEngine';
import { applyDelta } from './nodeEngine';

export type ResourceTotals = Record<ResourceType, number>;

export type ResourceControllerResult = {
  totals: ResourceTotals;
  unlockedResources: ResourceType[];
  changed: boolean;
};

const hasDelta = (delta: ResourceDelta) => (Object.values(delta) as number[]).some((amount) => amount > 0);

export const updateResourceTotals = (
  current: ResourceTotals,
  delta: ResourceDelta
): ResourceControllerResult => {
  if (!hasDelta(delta)) {
    return {
      totals: current,
      unlockedResources: [],
      changed: false,
    } satisfies ResourceControllerResult;
  }

  const totals = applyDelta(current, delta);
  const unlockedResources = (Object.keys(delta) as ResourceType[]).filter(
    (resource) => current[resource] === 0 && delta[resource] > 0
  );

  return {
    totals,
    unlockedResources,
    changed: true,
  } satisfies ResourceControllerResult;
};
