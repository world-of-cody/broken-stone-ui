export type ToolDefinition = {
  id: 'bronze-pick' | 'iron-pick' | 'obsidian-pick';
  name: string;
  damage: number;
  sprite: 'bronze' | 'iron' | 'obsidian';
  spark: string;
  description: string;
};

export const TOOL_LIBRARY: ToolDefinition[] = [
  {
    id: 'bronze-pick',
    name: 'Bronze Pickaxe',
    damage: 1,
    sprite: 'bronze',
    spark: '#f97316',
    description: 'Starter pickaxe. Reliable for soft stone and basic ore extraction.',
  },
  {
    id: 'iron-pick',
    name: 'Iron Pickaxe',
    damage: 2,
    sprite: 'iron',
    spark: '#38bdf8',
    description: 'Tempered steel head that cuts through stone faster. +1 base damage.',
  },
  {
    id: 'obsidian-pick',
    name: 'Obsidian Pickaxe',
    damage: 4,
    sprite: 'obsidian',
    spark: '#a855f7',
    description: 'Channelled shard core. Massive damage spikes against crystalline nodes.',
  },
];

export const getToolById = (toolId: ToolDefinition['id']) =>
  TOOL_LIBRARY.find((tool) => tool.id === toolId) ?? TOOL_LIBRARY[0];
