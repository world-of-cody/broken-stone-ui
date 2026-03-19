import type { ToolDefinition } from './tools';

export type ResourceKey = 'chips' | 'ingots' | 'shards';

export type ShopCost = {
  resource: ResourceKey;
  amount: number;
  label?: string;
};

export type UnlockCondition =
  | { type: 'resource'; resource: ResourceKey; amount: number; label?: string }
  | { type: 'ownsTool'; toolId: ToolDefinition['id']; label?: string };

export type BoosterEffect = {
  damageMultiplier?: number;
};

export type ShopItemBase = {
  id: string;
  name: string;
  description: string;
  tooltip?: string;
  cost: ShopCost[];
  unlocks?: UnlockCondition[];
  badge?: string;
};

export type ToolShopItem = ShopItemBase & {
  type: 'tool';
  toolId: ToolDefinition['id'];
};

export type BoosterShopItem = ShopItemBase & {
  type: 'booster';
  durationMs: number;
  effect: BoosterEffect;
};

export type UnlockShopItem = ShopItemBase & {
  type: 'unlock';
  unlockKey: string;
};

export type ShopItem = ToolShopItem | BoosterShopItem | UnlockShopItem;

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'iron-pick-upgrade',
    type: 'tool',
    name: 'Iron Pickaxe',
    toolId: 'iron-pick',
    description: 'Tempered iron head doubles the impact surface.',
    tooltip: '+1 base damage, cool blue sparks.',
    cost: [{ resource: 'chips', amount: 50, label: 'Chips' }],
    unlocks: [{ type: 'resource', resource: 'shards', amount: 1, label: 'Crystals' }],
  },
  {
    id: 'obsidian-pick-upgrade',
    type: 'tool',
    name: 'Obsidian Pickaxe',
    toolId: 'obsidian-pick',
    description: 'Shard-forged edge that pulverizes stone.',
    tooltip: '+2 base damage spike, violet spark trail.',
    cost: [
      { resource: 'chips', amount: 120, label: 'Chips' },
      { resource: 'shards', amount: 4, label: 'Crystals' },
    ],
    unlocks: [
      { type: 'ownsTool', toolId: 'iron-pick', label: 'Requires Iron Pickaxe' },
      { type: 'resource', resource: 'shards', amount: 3, label: 'Crystals' },
    ],
  },
  {
    id: 'forge-booster',
    type: 'booster',
    name: 'Forge Booster',
    description: 'Superheat the pick head for a short burst.',
    tooltip: 'x2 damage for 30 seconds.',
    badge: 'Timed',
    cost: [
      { resource: 'chips', amount: 35, label: 'Chips' },
      { resource: 'shards', amount: 2, label: 'Crystals' },
    ],
    unlocks: [{ type: 'resource', resource: 'chips', amount: 20, label: 'Chips' }],
    durationMs: 30000,
    effect: {
      damageMultiplier: 2,
    },
  },
  {
    id: 'surveyor-upgrade',
    type: 'unlock',
    unlockKey: 'surveyor',
    name: 'Surveyor Lens',
    description: 'Calibrated optics that reveal crystalline anomalies.',
    tooltip: 'Unlocks Crystal Geode spawns and analytics hooks.',
    cost: [
      { resource: 'chips', amount: 90, label: 'Chips' },
      { resource: 'ingots', amount: 2, label: 'Ingots' },
      { resource: 'shards', amount: 3, label: 'Shards' },
    ],
    unlocks: [
      { type: 'resource', resource: 'chips', amount: 60, label: 'Chips' },
      { type: 'ownsTool', toolId: 'iron-pick', label: 'Requires Iron Pickaxe' },
    ],
  },
];

export const SHOP_TABS = [
  { id: 'tools', label: 'Tools' },
  { id: 'boosters', label: 'Boosters' },
  { id: 'upgrades', label: 'Upgrades' },
] as const;
