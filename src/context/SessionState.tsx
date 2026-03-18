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
  type BoosterInstance,
  type PurchaseResult,
  unmetUnlockReasons,
} from '../state/shopLogic';

const STORAGE_KEY = 'broken-stone:session:v2';
export const SESSION_STORAGE_KEY = STORAGE_KEY;

export type Tool = ToolDefinition;

type ResourceMap = {
  ore: number;
  shards: number;
};

export type SessionState = {
  stoneHP: number;
  stoneMaxHP: number;
  resources: ResourceMap;
  equippedTool: Tool;
  ownedToolIds: Tool['id'][];
  activeBoosters: BoosterInstance[];
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

const defaultState: SessionState = {
  stoneHP: 80,
  stoneMaxHP: 80,
  resources: { ore: 0, shards: 0 },
  equippedTool: defaultTool,
  ownedToolIds: [defaultTool.id],
  activeBoosters: [],
};

const SessionStateContext = createContext<SessionContextValue | null>(null);

type HitComputation = {
  nextState: SessionState;
  hitDetail: {
    damage: number;
    previousHP: number;
    nextHP: number;
    toolId: string;
  };
  resourceDetail?: {
    oreDelta: number;
    shardsDelta: number;
    totals: SessionState['resources'];
  };
};

const computeHit = (state: SessionState, damage: number): HitComputation => {
  const previousHP = state.stoneHP;
  const rawHP = Math.max(0, previousHP - damage);
  let oreDelta = damage;
  let shardsDelta = 0;
  let stoneHP = rawHP;
  let resources = state.resources;

  if (rawHP === 0) {
    stoneHP = state.stoneMaxHP;
    oreDelta += 5;
    shardsDelta = 1;
    resources = {
      ore: state.resources.ore + oreDelta,
      shards: state.resources.shards + shardsDelta,
    };
  } else {
    resources = {
      ore: state.resources.ore + oreDelta,
      shards: state.resources.shards,
    };
  }

  const nextState: SessionState = {
    ...state,
    stoneHP,
    resources,
  };

  const hitDetail = {
    damage,
    previousHP,
    nextHP: stoneHP,
    toolId: state.equippedTool.id,
  };

  const resourceDetail = oreDelta || shardsDelta
    ? {
        oreDelta,
        shardsDelta,
        totals: resources,
      }
    : undefined;

  return { nextState, hitDetail, resourceDetail };
};

const emitEvent = (name: string, detail: Record<string, unknown>) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(name, { detail }));
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug(`[broken-stone] ${name}`, detail);
  }
};

const sanitizeBoosters = (boosters: BoosterInstance[]) => boosters.filter((booster) => booster.expiresAt > Date.now());

const hydrateState = (): SessionState => {
  if (typeof window === 'undefined') return defaultState;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return defaultState;
  try {
    const parsed = JSON.parse(stored) as Partial<SessionState>;
    const equippedTool = getToolById(parsed?.equippedTool?.id ?? defaultTool.id);
    const ownedToolIds = Array.from(new Set(parsed?.ownedToolIds?.length ? parsed.ownedToolIds : defaultState.ownedToolIds));
    const activeBoosters = sanitizeBoosters(parsed?.activeBoosters ?? []);

    return {
      ...defaultState,
      ...parsed,
      resources: {
        ...defaultState.resources,
        ...parsed?.resources,
      },
      ownedToolIds,
      activeBoosters,
      equippedTool,
    };
  } catch (error) {
    console.warn('[broken-stone] Failed to hydrate session state', error);
    return defaultState;
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
      const baseDamage = incomingDamage ?? previous.equippedTool.damage;
      const boostedDamage = computeDamageWithBoosters(baseDamage, previous.activeBoosters);
      const { nextState, hitDetail, resourceDetail } = computeHit(previous, boostedDamage);
      emitEvent('stone:hit', hitDetail);
      if (resourceDetail) {
        emitEvent('resource:changed', resourceDetail);
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
      if (item.type === 'tool' && isItemOwned(item, previous)) {
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
    setState(defaultState);
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
