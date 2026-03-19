import { SHOP_ITEMS, type ShopItem, type UnlockCondition, type BoosterShopItem, type ResourceKey } from '../data/shopCatalog';
import { getToolById } from '../data/tools';
import type { SessionState } from '../context/SessionState';

export type BoosterInstance = {
  id: string;
  itemId: string;
  name: string;
  startedAt: number;
  expiresAt: number;
  durationMs: number;
  effect: BoosterShopItem['effect'];
};

export const getShopItem = (itemId: string) => SHOP_ITEMS.find((item) => item.id === itemId);

const RESOURCE_LABELS: Record<ResourceKey, string> = {
  chips: 'Chips',
  ingots: 'Ingots',
  shards: 'Crystals',
};



const labelForCondition = (condition: UnlockCondition) => {
  if (condition.label) return condition.label;
  if (condition.type === 'resource') {
    const label = RESOURCE_LABELS[condition.resource];
    return `Requires ${condition.amount} ${label}`;
  }
  return 'Requires previous upgrade';
};

export const unmetUnlockReasons = (item: ShopItem, state: SessionState) => {
  if (!item.unlocks?.length) return [] as string[];
  const reasons: string[] = [];
  item.unlocks.forEach((unlock) => {
    if (unlock.type === 'resource') {
      if ((state.resources[unlock.resource] ?? 0) < unlock.amount) {
        reasons.push(labelForCondition(unlock));
      }
    } else if (!state.ownedToolIds.includes(unlock.toolId)) {
      reasons.push(unlock.label ?? 'Requires previous upgrade');
    }
  });
  return reasons;
};

export const canAffordItem = (item: ShopItem, state: SessionState) =>
  item.cost.every((cost) => (state.resources[cost.resource] ?? 0) >= cost.amount);

export const isItemOwned = (item: ShopItem, state: SessionState) => {
  if (item.type === 'tool') {
    return state.ownedToolIds.includes(item.toolId);
  }
  if (item.type === 'unlock') {
    return Boolean(state.unlocks?.[item.unlockKey]);
  }
  return false;
};

export const isBoosterActive = (item: ShopItem, state: SessionState) => {
  if (item.type !== 'booster') return false;
  return state.activeBoosters.some((booster) => booster.itemId === item.id && booster.expiresAt > Date.now());
};

const deductCost = (state: SessionState, item: ShopItem) => {
  const nextResources = { ...state.resources } as SessionState['resources'];
  item.cost.forEach((cost) => {
    nextResources[cost.resource] = Math.max(0, nextResources[cost.resource] - cost.amount);
  });
  return nextResources;
};

export type PurchaseError = 'LOCKED' | 'INSUFFICIENT' | 'OWNED';
export type PurchaseResult = { success: true } | { success: false; reason: PurchaseError };

export const applyPurchase = (state: SessionState, item: ShopItem, timestamp = Date.now()): SessionState => {
  const nextResources = deductCost(state, item);

  if (item.type === 'tool') {
    const tool = getToolById(item.toolId);
    const ownedToolIds = state.ownedToolIds.includes(item.toolId)
      ? state.ownedToolIds
      : [...state.ownedToolIds, item.toolId];
    return {
      ...state,
      resources: nextResources,
      ownedToolIds,
      equippedTool: tool,
    };
  }

  if (item.type === 'unlock') {
    return {
      ...state,
      resources: nextResources,
      unlocks: {
        ...state.unlocks,
        [item.unlockKey]: true,
      },
    };
  }

  const refreshedBoosters = state.activeBoosters.filter((booster) => booster.itemId !== item.id);
  const booster = {
    id: `${item.id}:${timestamp}`,
    itemId: item.id,
    name: item.name,
    effect: item.effect,
    startedAt: timestamp,
    expiresAt: timestamp + item.durationMs,
    durationMs: item.durationMs,
  } satisfies BoosterInstance;

  return {
    ...state,
    resources: nextResources,
    activeBoosters: [...refreshedBoosters, booster],
  };
};

export const computeDamageWithBoosters = (baseDamage: number, boosters: BoosterInstance[]) =>
  boosters.reduce((damage, booster) => {
    if (booster.effect.damageMultiplier) {
      return damage * booster.effect.damageMultiplier;
    }
    return damage;
  }, baseDamage);
