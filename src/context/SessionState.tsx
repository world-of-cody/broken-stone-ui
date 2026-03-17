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

const STORAGE_KEY = 'broken-stone:session:v1';
export const SESSION_STORAGE_KEY = STORAGE_KEY;


export type Tool = {
  id: string;
  name: string;
  damage: number;
  sprite: 'bronze' | 'iron' | 'obsidian';
};

export type SessionState = {
  stoneHP: number;
  stoneMaxHP: number;
  resources: {
    ore: number;
    shards: number;
  };
  equippedTool: Tool;
};

type SessionContextValue = {
  state: SessionState;
  tools: Tool[];
  hitStone: (damage?: number) => void;
  swapTool: (toolId: string) => void;
  resetSession: () => void;
};

const TOOLS: Tool[] = [
  { id: 'bronze-pick', name: 'Bronze Pickaxe', damage: 1, sprite: 'bronze' },
  { id: 'iron-pick', name: 'Iron Pickaxe', damage: 2, sprite: 'iron' },
  { id: 'obsidian-pick', name: 'Obsidian Pickaxe', damage: 4, sprite: 'obsidian' },
];

const defaultState: SessionState = {
  stoneHP: 80,
  stoneMaxHP: 80,
  resources: { ore: 0, shards: 0 },
  equippedTool: TOOLS[0],
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

const hydrateState = (): SessionState => {
  if (typeof window === 'undefined') return defaultState;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return defaultState;
  try {
    const parsed = JSON.parse(stored) as Partial<SessionState>;
    return {
      ...defaultState,
      ...parsed,
      resources: {
        ...defaultState.resources,
        ...parsed?.resources,
      },
      equippedTool:
        TOOLS.find((tool) => tool.id === parsed?.equippedTool?.id) ?? defaultState.equippedTool,
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

  const hitStone = useCallback((incomingDamage?: number) => {
    setState((previous) => {
      const damage = incomingDamage ?? previous.equippedTool.damage;
      const { nextState, hitDetail, resourceDetail } = computeHit(previous, damage);
      emitEvent('stone:hit', hitDetail);
      if (resourceDetail) {
        emitEvent('resource:changed', resourceDetail);
      }
      return nextState;
    });
  }, []);

  const swapTool = useCallback((toolId: string) => {
    setState((previous) => {
      const nextTool = TOOLS.find((tool) => tool.id === toolId) ?? previous.equippedTool;
      if (nextTool.id === previous.equippedTool.id) {
        return previous;
      }
      return {
        ...previous,
        equippedTool: nextTool,
      };
    });
  }, []);

  const resetSession = useCallback(() => {
    setState(defaultState);
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({ state, tools: TOOLS, hitStone, swapTool, resetSession }),
    [hitStone, resetSession, state, swapTool]
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
  