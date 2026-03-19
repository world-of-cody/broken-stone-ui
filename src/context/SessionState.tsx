
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { getToolById, TOOL_LIBRARY, type ToolDefinition } from '../data/tools';
import {
  applyPurchase,
  canAffordItem,
  computeDamageWithBoosters,
  getShopItem,
  isItemOwned,
  unmetUnlockReasons,
  type BoosterInstance,
  type PurchaseResult,
} from '../state/shopLogic';
import {
  BASE_NODE_ID,
  getNodeById,
  type NodeDefinition,
  type ResourceType,
} from '../data/nodes';
import {
  isCritWindowActive,
  pickNextNode,
  resolveNodeRewards,
  zeroResourceDelta,
} from '../state/nodeEngine';
import { updateResourceTotals } from '../state/resourceController';

const STORAGE_KEY = 'broken-stone:session:v2';
export const SESSION_STORAGE_KEY = STORAGE_KEY;

export type Tool = ToolDefinition;

type ActiveNodeState = {
  id: NodeDefinition['id'];
  hp: number;
};

export type ResourceMap = Record<ResourceType, number>;

type HitSnapshot = {
  timestamp: number;
  wasCrit: boolean;
  nodeId: NodeDefinition['id'];
};

export type SessionState = {
  stoneHP: number;
  stoneMaxHP: number;
  resources: ResourceMap;
  equippedTool: Tool;
  ownedToolIds: Tool['id'][];
  activeBoosters: BoosterInstance[];
  activeNode: ActiveNodeState;
  unlocks: Record<string, boolean>;
  lastHitAt: number | null;
  lastCritAt: number | null;
  lastHitResult: HitSnapshot | null;
};

type SessionContextValue = {
  state: SessionState;
  tools: Tool[];
  hitStone: (damage?: number) => void;
  swapTool: (toolId: Tool['id']) => void;
  purchaseItem: (itemId: string) => PurchaseResult;
  resetSession: () => void;
};

const defaultTool = TOOL_LIBRARY[0];

const sanitizeResources = (resources?: Partial<ResourceMap & { ore?: number }>): ResourceMap => ({
  chips: resources?.chips ?? resources?.ore ?? 0,
  ingots: resources?.ingots ?? 0,
  shards: resources?.shards ?? 0,
});

const buildActiveNode = (nodeId: NodeDefinition['id'] = BASE_NODE_ID, hp?: number): ActiveNodeState => {
  const definition = getNodeById(nodeId);
  const clampedHp = Math.min(hp ?? definition.maxHP, definition.maxHP);
  return { id: definition.id, hp: clampedHp };
};

const buildDefaultState = (): SessionState => {
  const nodeDefinition = getNodeById(BASE_NODE_ID);
  const activeNode = buildActiveNode(BASE_NODE_ID, nodeDefinition.maxHP);
  return {
    stoneHP: nodeDefinition.maxHP,
    stoneMaxHP: nodeDefinition.maxHP,
    resources: { chips: 0, ingots: 0, shards: 0 },
    equippedTool: defaultTool,
    ownedToolIds: [defaultTool.id],
    activeBoosters: [],
    activeNode,
    unlocks: {},
    lastHitAt: null,
    lastCritAt: null,
    lastHitResult: null,
  };
};

const SessionStateContext = createContext<SessionContextValue | null>(null);

const sanitizeBoosters = (boosters: BoosterInstance[]) => boosters.filter((booster) => booster.expiresAt > Date.now());

const spawnNodeState = (state: Pick<SessionState, 'ownedToolIds' | 'unlocks'>, rng: () => number = Math.random): ActiveNodeState => {
  const node = pickNextNode({ ownedToolIds: state.ownedToolIds, unlocks: state.unlocks }, rng);
  const definition = getNodeById(node.id);
  return { id: node.id, hp: definition.maxHP };
};

const hydrateState = (): SessionState => {
  if (typeof window === 'undefined') return buildDefaultState();
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return buildDefaultState();
  try {
    const parsed = JSON.parse(stored) as Partial<SessionState> & { resources?: Record<string, number> };
    const equippedTool = getToolById(parsed?.equippedTool?.id ?? defaultTool.id);
    const ownedToolIds = Array.from(
      new Set(parsed?.ownedToolIds?.length ? parsed.ownedToolIds : [defaultTool.id])
    );
    const activeBoosters = sanitizeBoosters(parsed?.activeBoosters ?? []);
    const unlocks = parsed?.unlocks ?? {};
    const resources = sanitizeResources(parsed?.resources);
    const hydratedNode = parsed?.activeNode ?? buildActiveNode();
    const nodeDefinition = getNodeById(hydratedNode.id);
    const stoneMaxHP = nodeDefinition.maxHP;
    const stoneHP = Math.min(parsed?.stoneHP ?? hydratedNode.hp ?? stoneMaxHP, stoneMaxHP);
    const activeNode: ActiveNodeState = { id: nodeDefinition.id, hp: stoneHP };

    return {
      ...buildDefaultState(),
      ...parsed,
      stoneHP,
      stoneMaxHP,
      resources,
      ownedToolIds,
      activeBoosters,
      equippedTool,
      activeNode,
      unlocks,
      lastHitAt: parsed?.lastHitAt ?? null,
      lastCritAt: parsed?.lastCritAt ?? null,
      lastHitResult: null,
    } satisfies SessionState;
  } catch (error) {
    console.warn('[broken-stone] Failed to hydrate session state', error);
    return buildDefaultState();
  }
};

const emitEvent = (name: string, detail: Record<string, unknown>) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(name, { detail }));
  if (import.meta.env.DEV) {
    console.debug(`[broken-stone] ${name}`, detail);
  }
};

export const SessionStateProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<SessionState>(() => hydrateState());
  const hasHydratedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!hasHydratedRef.current) {
      hasHydratedRef.current = true;
      return;
    }

    const payload = JSON.stringify(state);
    const persist = () => window.localStorage.setItem(STORAGE_KEY, payload);

    if ('requestIdleCallback' in window) {
      (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(persist);
    } else {
      setTimeout(persist, 0);
    }
  }, [state]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const interval = window.setInterval(() => {
      setState((previous) => {
        const activeBoosters = sanitizeBoosters(previous.activeBoosters);
        if (activeBoosters.length === previous.activeBoosters.length) {
          return previous;
        }
        return {
          ...previous,
          activeBoosters,
        };
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const hitStone = useCallback((incomingDamage?: number) => {
    setState((previous) => {
      const nodeDefinition = getNodeById(previous.activeNode.id);
      const now = Date.now();
      const baseDamage = incomingDamage ?? previous.equippedTool.damage;
      const boostedDamage = Math.max(1, Math.round(computeDamageWithBoosters(baseDamage, previous.activeBoosters)));
      const isCrit = isCritWindowActive(previous.lastHitAt, now, nodeDefinition.crit.windowMs);
      const damage = Math.max(1, Math.round(boostedDamage * (isCrit ? nodeDefinition.crit.multiplier : 1)));
      const remainingHP = Math.max(0, previous.activeNode.hp - damage);

      let resources = previous.resources;
      let resourceDelta = zeroResourceDelta();
      let resourceUpdate: ReturnType<typeof updateResourceTotals> | null = null;
      let nextNode = previous.activeNode;
      let stoneMaxHP = previous.stoneMaxHP;
      let respawned = false;

      if (remainingHP === 0) {
        resourceDelta = resolveNodeRewards(nodeDefinition, { isCrit });
        resourceUpdate = updateResourceTotals(previous.resources, resourceDelta);
        resources = resourceUpdate.totals;
        nextNode = spawnNodeState(previous);
        stoneMaxHP = getNodeById(nextNode.id).maxHP;
        respawned = true;
      }

      const unlockedResources = resourceUpdate?.unlockedResources ?? [];
      unlockedResources.forEach((resource) => {
        console.log(`[analytics] Resource unlocked: ${resource}`);
      });

      const nextActiveNode: ActiveNodeState = respawned ? nextNode : { ...nextNode, hp: remainingHP };
      const nextStoneHP = respawned ? nextActiveNode.hp : remainingHP;

      const nextState: SessionState = {
        ...previous,
        stoneHP: nextStoneHP,
        stoneMaxHP,
        resources,
        activeNode: nextActiveNode,
        lastHitAt: now,
        lastCritAt: isCrit ? now : previous.lastCritAt,
        lastHitResult: {
          timestamp: now,
          wasCrit: isCrit,
          nodeId: nodeDefinition.id,
        },
      };

      emitEvent('stone:hit', {
        damage,
        previousHP: previous.activeNode.hp,
        nextHP: nextState.activeNode.hp,
        toolId: previous.equippedTool.id,
        nodeId: nodeDefinition.id,
        wasCrit: isCrit,
        respawned,
      });

      if (resourceUpdate?.changed) {
        emitEvent('resource:changed', {
          nodeId: nodeDefinition.id,
          wasCrit: isCrit,
          delta: resourceDelta,
          totals: resources,
        });
      }

      return nextState;
    });
  }, []);

  const swapTool = useCallback((toolId: Tool['id']) => {
    setState((previous) => {
      if (!previous.ownedToolIds.includes(toolId)) {
        return previous;
      }
      const nextTool = getToolById(toolId);
      if (nextTool.id === previous.equippedTool.id) {
        return previous;
      }
      return {
        ...previous,
        equippedTool: nextTool,
      };
    });
  }, []);

  const purchaseItem = useCallback((itemId: string): PurchaseResult => {
    const item = getShopItem(itemId);
    if (!item) {
      return { success: false, reason: 'LOCKED' };
    }

    let result: PurchaseResult = { success: false, reason: 'LOCKED' };

    setState((previous) => {
      if (isItemOwned(item, previous)) {
        result = { success: false, reason: 'OWNED' };
        return previous;
      }

      const lockedReasons = unmetUnlockReasons(item, previous);
      if (lockedReasons.length) {
        result = { success: false, reason: 'LOCKED' };
        return previous;
      }

      if (!canAffordItem(item, previous)) {
        result = { success: false, reason: 'INSUFFICIENT' };
        return previous;
      }

      const nextState = applyPurchase(previous, item);
      result = { success: true };
      return nextState;
    });

    return result;
  }, []);

  const resetSession = useCallback(() => {
    setState(buildDefaultState());
  }, []);

  const ownedTools = useMemo(() => state.ownedToolIds.map((toolId) => getToolById(toolId)), [state.ownedToolIds]);

  const value = useMemo<SessionContextValue>(
    () => ({ state, tools: ownedTools, hitStone, swapTool, resetSession, purchaseItem }),
    [hitStone, ownedTools, purchaseItem, resetSession, state, swapTool]
  );

  return <SessionStateContext.Provider value={value}>{children}</SessionStateContext.Provider>;
};

export const useSessionState = () => {
  const context = useContext(SessionStateContext);
  if (!context) {
    throw new Error('useSessionState must be used within SessionStateProvider');
  }
  return context;
};
