import type { CSSProperties } from 'react';
import { useSessionState } from '../context/SessionState';

export const ToolSlot = () => {
  const {
    state: { equippedTool },
    tools,
    swapTool,
  } = useSessionState();

  const sparkStyle = { '--spark-color': equippedTool.spark } as CSSProperties;

  return (
    <section className="tool-slot" aria-label="Equipped tool">
      <div className={`tool-slot__sprite tool-slot__sprite--${equippedTool.sprite}`} style={sparkStyle} />
      <div className="tool-slot__meta">
        <p className="tool-slot__title">{equippedTool.name}</p>
        <p className="subtext">Damage: {equippedTool.damage}</p>
      </div>
      <div className="tool-slot__actions">
        {tools.map((tool) => (
          <button
            type="button"
            key={tool.id}
            className={`tool-slot__action ${tool.id === equippedTool.id ? 'tool-slot__action--active' : ''}`}
            onClick={() => swapTool(tool.id)}
            disabled={tool.id === equippedTool.id}
          >
            {tool.name}
          </button>
        ))}
      </div>
    </section>
  );
};
