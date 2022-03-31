import type { RenderResult } from '@testing-library/react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import App from './App';
import MockProvider from './providers/mock/MockProvider';
import type { Vis } from './vis-packs/core/visualizations';

interface RenderAppResult extends RenderResult {
  user: ReturnType<typeof userEvent.setup>;
  selectExplorerNode: (path: string) => Promise<void>;
  selectVisTab: (name: Vis) => Promise<void>;
}

export async function renderApp(): Promise<RenderAppResult> {
  const user = userEvent.setup({ delay: null }); // https://github.com/testing-library/user-event/issues/833
  const renderResult = render(
    <MockProvider>
      <App />
    </MockProvider>
  );

  await screen.findByLabelText('Loading root metadata...');
  await screen.findByRole('treeitem', { name: 'entities' });

  return {
    user,
    ...renderResult,

    selectExplorerNode: async (path) => {
      for await (const segment of path.split('/')) {
        await user.click(
          await screen.findByRole('treeitem', {
            name: new RegExp(`^${segment}(?: \\(NeXus group\\))?$`, 'u'), // account for potential NeXus badge
          })
        );
      }
    },

    selectVisTab: async (name) => {
      await user.click(await screen.findByRole('tab', { name }));
    },
  };
}

export function queryVisSelector(): HTMLElement | null {
  return screen.queryByRole('tablist', { name: 'Visualization' });
}

export async function findVisSelector(): Promise<HTMLElement> {
  return screen.findByRole('tablist', { name: 'Visualization' });
}

export async function findVisSelectorTabs(): Promise<HTMLElement[]> {
  return within(await findVisSelector()).getAllByRole('tab');
}

/**
 * Mock console method in test.
 * Mocks are automatically restored after every test, but to restore
 * the original console method earlier, call `spy.mockRestore()`.
 */
export function mockConsoleMethod(method: 'log' | 'warn' | 'error') {
  const spy = jest.spyOn(console, method);
  spy.mockImplementation(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function
  return spy;
}
