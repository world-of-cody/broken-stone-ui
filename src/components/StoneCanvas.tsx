import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useDamageEngine } from '../hooks/useDamageEngine';
import { useSessionState } from '../context/SessionState';
import {
  BASE_NODE_ID,
  getNodeById,
  type ResourceType,
  type RewardDescriptor,
} from '../data/nodes';

const RESOURCE_LABELS: Record<ResourceType, string> = {
  chips: 'Chips',
  ingots: 'Ingots',
  shards: 'Crystal Shards',
};

const RESOURCE_ICONS: Record<ResourceType, string> = {
  chips: '🪙',
  ingots: '⛓️',
  shards: '💎',
};

const formatReward = (reward: RewardDescriptor) => {
  const chance = reward.chance != null ? `${Math.round(reward.chance * 100)}% chance` : 'Guaranteed';
  const crit = reward.critBonus ? ` +${reward.critBonus} on crit` : '';
  return `${chance} · +${reward.amount} ${RESOURCE_LABELS[reward.resource]}${crit}`;
};

const buildHitboxClass = (isAnimating: boolean, isRareNode: boolean, isCritReady: boolean) =>
  [
    'stone-canvas__hitbox',
    isAnimating && 'stone-canvas__hitbox--hit',
    isRareNode && 'stone-canvas__hitbox--rare',
    isCritReady && 'stone-canvas__hitbox--crit-ready',
  ]
    .filter(Boolean)
    .join(' ');

export const StoneCanvas = () => {
  const {
    state: { stoneHP, stoneMaxHP, equippedTool, activeNode, lastHitResult, lastHitAt },
  } = useSessionState();
  const { handleHit, isAnimating } = useDamageEngine();

  const nodeDefinition = useMemo(() => getNodeById(activeNode.id), [activeNode.id]);
  const isRareNode = nodeDefinition.id !== BASE_NODE_ID;

  const hpPercentage = useMemo(() => Math.round((stoneHP / stoneMaxHP) * 100), [stoneHP, stoneMaxHP]);
  const sparkStyle = useMemo(() => ({ '--spark-color': equippedTool.spark } as CSSProperties), [equippedTool.spark]);

  const [isCritReady, setIsCritReady] = useState(false);
  const [isCritFlashing, setIsCritFlashing] = useState(false);

  useEffect(() => {
    if (!lastHitAt) {
      setIsCritReady(false);
      return;
    }
    setIsCritReady(true);
    const timeout = window.setTimeout(() => setIsCritReady(false), nodeDefinition.crit.windowMs);
    return () => window.clearTimeout(timeout);
  }, [lastHitAt, nodeDefinition.crit.windowMs]);

  useEffect(() => {
    if (!lastHitResult?.wasCrit) return;
    setIsCritFlashing(true);
    const timeout = window.setTimeout(() => setIsCritFlashing(false), 220);
    return () => window.clearTimeout(timeout);
  }, [lastHitResult?.timestamp, lastHitResult?.wasCrit]);

  const hitboxClass = buildHitboxClass(isAnimating, isRareNode, isCritReady);

  return (
    <section className="stone-canvas" aria-label="Stone mining canvas">
      <div className="stone-canvas__hud">
        <div className="stone-canvas__node-label">
          <p>
            {nodeDefinition.label}
            {isRareNode && <span className="stone-canvas__rarity-badge">Rare Node</span>}
          </p>
          <small>{nodeDefinition.maxHP} hp pool · Crit x{nodeDefinition.crit.multiplier.toFixed(2)}</small>
        </div>
        <div className="stone-canvas__hp-wrapper" aria-live="polite">
          <span className="stone-canvas__hp-label">Stone Integrity</span>
          <div className="stone-canvas__hp-bar" role="progressbar" aria-valuenow={hpPercentage} aria-valuemin={0} aria-valuemax={100}>
            <div className="stone-canvas__hp-fill" style={{ width: `${hpPercentage}%` }} />
          </div>
        </div>
      </div>

      <button
        type="button"
        className={hitboxClass}
        style={sparkStyle}
        onPointerDown={handleHit}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleHit();
          }
        }}
      >
        <span className="sr-only">Hit the stone with the {equippedTool.name}</span>
        <div className={`stone-canvas__glow stone-canvas__glow--${nodeDefinition.visuals.glow}`} aria-hidden />
        <div className={`stone-canvas__sprite stone-canvas__sprite--${nodeDefinition.visuals.sprite}`} aria-hidden />
        {isRareNode && <div className="stone-canvas__particle-layer" aria-hidden />}
        {isCritFlashing && <div className="stone-canvas__crit-flash" aria-hidden />}
        <div className="stone-canvas__tool readout">
          <p>{equippedTool.name}</p>
          <p className="subtext">
            {equippedTool.damage} dmg · x{nodeDefinition.crit.multiplier.toFixed(2)} crit
          </p>
          {isCritReady && <span className="stone-canvas__crit-window">Crit window!</span>}
        </div>
      </button>

      <ul className="stone-canvas__drops" aria-label="Resource rewards">
        {nodeDefinition.rewards.map((reward) => (
          <li key={`${nodeDefinition.id}-${reward.resource}-${reward.amount}`} className="stone-canvas__drop-item">
            <div className="stone-canvas__drop-icon" aria-hidden>
              {RESOURCE_ICONS[reward.resource]}
            </div>
            <div>
              <p className="stone-canvas__drop-label">{RESOURCE_LABELS[reward.resource]}</p>
              <p className="stone-canvas__drop-meta">{formatReward(reward)}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};
