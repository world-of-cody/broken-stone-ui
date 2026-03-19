import { describe, expect, it, beforeEach, vi } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { render } from '../tests/test-utils';
import { SessionStateProvider, SESSION_STORAGE_KEY, useSessionState } from './SessionState';

const Consumer = () => {
  const { state, hitStone, swapTool, purchaseItem } = useSessionState();
  return (
    <div>
      <p data-testid="hp">{state.stoneHP}</p>
      <p data-testid="chips">{state.resources.chips}</p>
      <p data-testid="tool">{state.equippedTool.id}</p>
      <button onClick={() => hitStone(2)}>Hit</button>
      <button onClick={() => hitStone(120)}>Break</button>
      <button onClick={() => purchaseItem('iron-pick-upgrade')}>Buy Iron</button>
      <button onClick={() => swapTool('iron-pick')}>Equip Iron</button>
      <button onClick={() => swapTool('bronze-pick')}>Equip Bronze</button>
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
        resources: { chips: 10, shards: 2 },
        equippedTool: { id: 'iron-pick' },
        ownedToolIds: ['bronze-pick', 'iron-pick'],
      })
    );

    const { getByTestId } = render(
      <SessionStateProvider>
        <Consumer />
      </SessionStateProvider>
    );

    expect(getByTestId('hp')).toHaveTextContent('42');
    expect(getByTestId('chips')).toHaveTextContent('10');
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

    fireEvent.click(getByText('Break'));
    expect(Number(getByTestId('chips').textContent)).toBeGreaterThan(0);
  });

  it('can purchase and swap tools when unlocked', () => {
    window.localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({
        resources: { chips: 200, shards: 5 },
        equippedTool: { id: 'bronze-pick' },
        ownedToolIds: ['bronze-pick'],
      })
    );

    const { getByText, getByTestId } = render(
      <SessionStateProvider>
        <Consumer />
      </SessionStateProvider>
    );

    fireEvent.click(getByText('Buy Iron'));
    expect(getByTestId('tool')).toHaveTextContent('iron-pick');

    fireEvent.click(getByText('Equip Bronze'));
    expect(getByTestId('tool')).toHaveTextContent('bronze-pick');

    fireEvent.click(getByText('Equip Iron'));
    expect(getByTestId('tool')).toHaveTextContent('iron-pick');
  });
});
