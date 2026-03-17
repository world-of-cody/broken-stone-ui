import { useMemo } from 'react';
import { useDamageEngine } from '../hooks/useDamageEngine';
import { useSessionState } from '../context/SessionState';

export const StoneCanvas = () => {
  const {
    state: { stoneHP, stoneMaxHP, equippedTool },
  } = useSessionState();
  const { handleHit, isAnimating } = useDamageEngine();

  const hpPercentage = useMemo(() => Math.round((stoneHP / stoneMaxHP) * 100), [stoneHP, stoneMaxHP]);

  return (
    <section className="stone-canvas" aria-label="Stone mining canvas">
      <div className="stone-canvas__hud">
        <span className="stone-canvas__hp-label">Stone Integrity</span>
        <div className="stone-canvas__hp-bar" role="progressbar" aria-valuenow={hpPercentage} aria-valuemin={0} aria-valuemax={100}>
          <div className="stone-canvas__hp-fill" style={{ width: `${hpPercentage}%` }} />
        </div>
      </div>
      <button
        type="button"
        className={`stone-canvas__hitbox ${isAnimating ? 'stone-canvas__hitbox--hit' : ''}`}
        onPointerDown={handleHit}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleHit();
          }
        }}
      >
        <span className="sr-only">Hit the stone with the {equippedTool.name}</span>
        <div className={`stone-canvas__sprite stone-canvas__sprite--${equippedTool.sprite}`} />
        <div className="stone-canvas__tool readout">
          <p>{equippedTool.name}</p>
          <p className="subtext">{equippedTool.damage} dmg</p>
        </div>
      </button>
    </section>
  );
};
