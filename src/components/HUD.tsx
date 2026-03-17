import { ResourceBar } from './ResourceBar';
import { useSessionState } from '../context/SessionState';

export const HUD = () => {
  const {
    state: { resources },
  } = useSessionState();

  return (
    <section className="hud" aria-label="Resource heads-up display">
      <ResourceBar label="Ore" value={resources.ore} icon={<span>🪨</span>} />
      <ResourceBar label="Shards" value={resources.shards} icon={<span>💎</span>} />
    </section>
  );
};
