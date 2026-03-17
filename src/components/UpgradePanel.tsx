const CTA_LABELS = ['Auto Miner', 'Gem Resonator', 'Drone Courier'];

export const UpgradePanel = () => (
  <section className="upgrade-panel" aria-label="Upgrade previews">
    <header>
      <p className="upgrade-panel__title">Upcoming Upgrades</p>
      <p className="subtext">Blueprint slots reserved for future releases.</p>
    </header>
    <div className="upgrade-panel__grid">
      {CTA_LABELS.map((label) => (
        <button key={label} type="button" className="upgrade-panel__card" disabled>
          <span>{label}</span>
          <span className="subtext">Coming soon</span>
        </button>
      ))}
    </div>
  </section>
);
