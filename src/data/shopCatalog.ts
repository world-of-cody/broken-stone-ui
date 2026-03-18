import type { ToolDefinition } from './tools';

export type ResourceKey = 'ore' | 'shards';

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

export type ShopItem = ToolShopItem | BoosterShopItem;

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'iron-pick-upgrade',
    type: 'tool',
    name: 'Iron Pickaxe',
    toolId: 'iron-pick',
    description: 'Tempered iron head doubles the impact surface.',
    tooltip: '+1 base damage, cool blue sparks.',
    cost: [{ resource: 'ore', amount: 50, label: 'Ore' }],
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
      { resource: 'ore', amount: 120, label: 'Ore' },
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
      { resource: 'ore', amount: 35, label: 'Ore' },
      { resource: 'shards', amount: 2, label: 'Crystals' },
    ],
    unlocks: [{ type: 'resource', resource: 'ore', amount: 20, label: 'Ore' }],
    durationMs: 30000,
    effect: {
      damageMultiplier: 2,
    },
  },
];

export const SHOP_TABS = [
  { id: 'tools', label: 'Tools' },
  { id: 'boosters', label: 'Boosters' },
] as const;
