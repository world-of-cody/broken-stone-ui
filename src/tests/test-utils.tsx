import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { SessionStateProvider } from '../context/SessionState';

const customRender = (ui: ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: SessionStateProvider, ...options });

export * from '@testing-library/react';
export { customRender as render };
