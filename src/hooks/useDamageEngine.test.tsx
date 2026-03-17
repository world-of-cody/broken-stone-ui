import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { useDamageEngine } from './useDamageEngine';
import { render } from '../tests/test-utils';

const Harness = () => {
  const { handleHit } = useDamageEngine();
  return (
    <button type="button" onClick={handleHit}>
      hit
    </button>
  );
};

describe('useDamageEngine', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('dispatches custom events when hitting the stone', () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

    const { getByText } = render(<Harness />);

    fireEvent.click(getByText('hit'));

    expect(dispatchSpy).toHaveBeenCalled();
    const eventNames = dispatchSpy.mock.calls.map(([event]) => (event as CustomEvent).type);
    expect(eventNames).toContain('stone:hit');
  });
});
