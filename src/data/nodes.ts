export type ResourceType = 'chips' | 'ingots' | 'shards';

export type NodeUnlockState = {
  ownedToolIds: string[];
  unlocks?: Record<string, boolean>;
};

export type RewardDescriptor = {
  resource: ResourceType;
  amount: number;
  chance?: number;
  critBonus?: number;
};

export type NodeDefinition = {
  id: 'basalt-core' | 'iron-vein' | 'crystal-geode';
  label: string;
  maxHP: number;
  spawnChance: number;
  unlocksWhen: (state: NodeUnlockState) => boolean;
  rewards: RewardDescriptor[];
  crit: {
    multiplier: number;
    windowMs: number;
  };
  visuals: {
    sprite: string;
    glow: string;
  };
};

const always = () => true;

export const NODE_DEFINITIONS: NodeDefinition[] = [
  {
    id: 'basalt-core',
    label: 'Basalt Core',
    maxHP: 80,
    spawnChance: 1,
    unlocksWhen: always,
    rewards: [{ resource: 'chips', amount: 1 }],
    crit: { multiplier: 1.5, windowMs: 250 },
    visuals: { sprite: 'stone', glow: 'amber' },
  },
  {
    id: 'iron-vein',
    label: 'Iron Vein',
    maxHP: 120,
    spawnChance: 0.35,
    unlocksWhen: (state) => state.ownedToolIds.includes('iron-pick'),
    rewards: [
      { resource: 'chips', amount: 4 },
      { resource: 'ingots', amount: 1, chance: 0.1 },
    ],
    crit: { multiplier: 1.75, windowMs: 220 },
    visuals: { sprite: 'iron', glow: 'cyan' },
  },
  {
    id: 'crystal-geode',
    label: 'Crystal Geode',
    maxHP: 150,
    spawnChance: 0.22,
    unlocksWhen: (state) => Boolean(state.unlocks?.surveyor),
    rewards: [
      { resource: 'chips', amount: 12 },
      { resource: 'shards', amount: 1, critBonus: 1 },
    ],
    crit: { multiplier: 2, windowMs: 200 },
    visuals: { sprite: 'crystal', glow: 'violet' },
  },
];

export const getNodeById = (id: NodeDefinition['id']) => NODE_DEFINITIONS.find((node) => node.id === id) ?? NODE_DEFINITIONS[0];
