import type { ReactNode } from 'react';

export type ResourceBarProps = {
  label: string;
  value: number;
  icon: ReactNode;
};

export const ResourceBar = ({ label, value, icon }: ResourceBarProps) => (
  <div className="resource-bar">
    <div className="resource-bar__icon" aria-hidden>
      {icon}
    </div>
    <div>
      <p className="resource-bar__label">{label}</p>
      <p className="resource-bar__value">{value.toLocaleString()}</p>
    </div>
  </div>
);
