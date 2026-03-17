import { useCallback, useEffect, useState } from 'react';
import { useSessionState } from '../context/SessionState';

export const useDamageEngine = () => {
  const {
    state: { equippedTool },
    hitStone,
  } = useSessionState();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleHit = useCallback(() => {
    setIsAnimating(true);
    hitStone(equippedTool.damage);
  }, [equippedTool.damage, hitStone]);

  useEffect(() => {
    if (!isAnimating) return;
    const timeout = window.setTimeout(() => setIsAnimating(false), 120);
    return () => window.clearTimeout(timeout);
  }, [isAnimating]);

  return {
    handleHit,
    isAnimating,
  };
};
