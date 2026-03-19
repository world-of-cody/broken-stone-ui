import { ResourceBar } from './ResourceBar';
import { useSessionState } from '../context/SessionState';

const RESOURCE_CONFIG = [
  { key: 'chips', label: 'Chips', icon: <span>🪙</span> },
  { key: 'ingots', label: 'Ingots', icon: <span>⛓️</span> },
  { key: 'shards', label: 'Crystal Shards', icon: <span>💎</span> },
] as const;

type ResourceKey = (typeof RESOURCE_CONFIG)[number]['key'];

export const HUD = () => {
  const {
    state: { resources },
  } = useSessionState();

  return (
    <section className="hud" aria-label="Resource heads-up display">
      {RESOURCE_CONFIG.map((config) => (
        <ResourceBar
          key={config.key}
          label={config.label}
          value={resources[config.key as ResourceKey]}
          icon={config.icon}
        />
      ))}
    </section>
  );
};
