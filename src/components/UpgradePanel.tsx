import { useMemo, useState, useEffect } from 'react';
import { SHOP_ITEMS, SHOP_TABS } from '../data/shopCatalog';
import { useSessionState } from '../context/SessionState';
import { canAffordItem, isBoosterActive, unmetUnlockReasons } from '../state/shopLogic';

const formatCost = (amount: number, label?: string) => `${amount} ${label ?? 'Ore'}`;

const formatMs = (ms: number) => {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes ? `${minutes}m ${seconds.toString().padStart(2, '0')}s` : `${seconds}s`;
};

export const UpgradePanel = () => {
  const { state, purchaseItem } = useSessionState();
  const [activeTab, setActiveTab] = useState<(typeof SHOP_TABS)[number]['id']>('tools');
  const [banner, setBanner] = useState<string>('');
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const filteredItems = useMemo(
    () => SHOP_ITEMS.filter((item) => (activeTab === 'tools' ? item.type === 'tool' : item.type === 'booster')),
    [activeTab]
  );

  const activeBoosters = useMemo(
    () =>
      state.activeBoosters
        .map((booster) => ({
          ...booster,
          remainingMs: Math.max(0, booster.expiresAt - now),
        }))
        .filter((instance) => instance.remainingMs > 0),
    [now, state.activeBoosters]
  );

  const handlePurchase = (itemId: string, label: string) => {
    const result = purchaseItem(itemId);
    if (result.success) {
      setBanner(`${label} adquirido.`);
      return;
    }

    if (result.reason === 'INSUFFICIENT') {
      setBanner('Necesitás más recursos para comprarlo.');
    } else if (result.reason === 'OWNED') {
      setBanner('Ya tenés esta herramienta.');
    } else {
      setBanner('Todavía no cumplís los requisitos.');
    }
  };

  return (
    <section className="upgrade-panel" aria-label="Workshop shop">
      <header className="upgrade-panel__header">
        <div>
          <p className="upgrade-panel__title">Workshop</p>
          <p className="subtext">Compra herramientas permanentes o boosters temporales.</p>
        </div>
        <div className="upgrade-panel__tabs" role="tablist" aria-label="Upgrade categories">
          {SHOP_TABS.map((tab) => (
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              key={tab.id}
              className={`upgrade-panel__tab ${activeTab === tab.id ? 'upgrade-panel__tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {banner ? <p className="upgrade-panel__banner">{banner}</p> : null}

      <div className="upgrade-panel__grid" role="list">
        {filteredItems.map((item) => {
          const lockedReasons = unmetUnlockReasons(item, state);
          const canAfford = canAffordItem(item, state);
          const owned = item.type === 'tool' && state.ownedToolIds.includes(item.toolId);
          const active = isBoosterActive(item, state);
          const disabled = owned || active || lockedReasons.length > 0 || !canAfford;
          const statusLabel = owned ? 'Equipada' : active ? 'Activa' : 'Comprar';

          return (
            <article key={item.id} className={`shop-card ${disabled ? 'shop-card--disabled' : ''}`} role="listitem">
              <header>
                <p className="shop-card__title" title={item.tooltip ?? item.description}>
                  {item.name}
                </p>
                <p className="subtext">{item.description}</p>
              </header>
              <div className="shop-card__costs" aria-label="Costos">
                {item.cost.map((cost) => (
                  <span key={`${item.id}-${cost.resource}`} className="shop-card__badge">
                    {formatCost(cost.amount, cost.label)}
                  </span>
                ))}
              </div>
              {lockedReasons.length ? (
                <div className="shop-card__requirements" aria-label="Requisitos">
                  {lockedReasons.map((reason) => (
                    <span key={reason} className="shop-card__badge shop-card__badge--warning">
                      {reason}
                    </span>
                  ))}
                </div>
              ) : null}
              <button
                type="button"
                className="shop-card__cta"
                disabled={disabled}
                onClick={() => handlePurchase(item.id, item.name)}
                title={item.tooltip ?? item.description}
              >
                {statusLabel}
              </button>
            </article>
          );
        })}
      </div>

      {activeBoosters.length ? (
        <div className="upgrade-panel__boosters" aria-live="polite">
          <p className="upgrade-panel__subtitle">Boosters activos</p>
          <div className="upgrade-panel__booster-grid">
            {activeBoosters.map((booster) => (
              <div key={booster.id} className="booster-chip">
                <span>{booster.name}</span>
                <span className="subtext">{formatMs(booster.remainingMs)} restantes</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
};
