import { describe, expect, it, beforeEach, vi } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { render } from '../tests/test-utils';
import { SessionStateProvider, SESSION_STORAGE_KEY, useSessionState } from './SessionState';

const Consumer = () => {
  const { state, hitStone, swapTool } = useSessionState();
  return (
    <div>
      <p data-testid="hp">{state.stoneHP}</p>
      <p data-testid="ore">{state.resources.ore}</p>
      <button onClick={() => hitStone(2)}>Hit</button>
      <button onClick={() => swapTool('iron-pick')}>Swap</button>
      <p data-testid="tool">{state.equippedTool.id}</p>
    </div>
  );
};

describe('SessionStateProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('hydrates from localStorage snapshot', () => {
    window.localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({
        stoneHP: 42,
        resources: { ore: 10, shards: 2 },
        equippedTool: { id: 'iron-pick' },
      })
    );

    const { getByTestId } = render(
      <SessionStateProvider>
        <Consumer />
      </SessionStateProvider>
    );

    expect(getByTestId('hp')).toHaveTextContent('42');
    expect(getByTestId('ore')).toHaveTextContent('10');
    expect(getByTestId('tool')).toHaveTextContent('iron-pick');
  });

  it('reduces HP and increases ore when hitting the stone', () => {
    const { getByText, getByTestId } = render(
      <SessionStateProvider>
        <Consumer />
      </SessionStateProvider>
    );

    fireEvent.click(getByText('Hit'));

    expect(Number(getByTestId('hp').textContent)).toBeLessThan(80);
    expect(Number(getByTestId('ore').textContent)).toBeGreaterThan(0);
  });

  it('swaps tools when requested', () => {
    const { getByText, getByTestId } = render(
      <SessionStateProvider>
        <Consumer />
      </SessionStateProvider>
    );

    fireEvent.click(getByText('Swap'));
    expect(getByTestId('tool')).toHaveTextContent('iron-pick');
  });
});
