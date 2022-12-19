import { assertDefined, assertNonNull } from '@h5web/shared';
import type { RenderResult } from '@testing-library/react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import App from './App';
import MockProvider from './providers/mock/MockProvider';
import type { Vis } from './vis-packs/core/visualizations';

interface RenderAppResult extends RenderResult {
  user: ReturnType<typeof userEvent.setup>;
  selectExplorerNode: (name: string) => Promise<void>;
  selectVisTab: (name: Vis) => Promise<void>;
}

type InitialPath = `/${string}`;
interface RenderAppOpts {
  initialPath?: InitialPath;
  preferredVis?: Vis | undefined;
}

export async function renderApp(
  opts: InitialPath | RenderAppOpts = '/'
): Promise<RenderAppResult> {
  const optsObj = typeof opts === 'string' ? { initialPath: opts } : opts;
  const { initialPath, preferredVis }: RenderAppOpts = {
    initialPath: '/',
    ...optsObj,
  };

  if (preferredVis) {
    window.localStorage.setItem(
      'h5web:preferredVis',
      JSON.stringify(preferredVis)
    );
  }

  const user = userEvent.setup({ delay: null }); // https://github.com/testing-library/user-event/issues/833
  const renderResult = render(
    <MockProvider>
      <App initialPath={initialPath} />
    </MockProvider>
  );

  await screen.findByLabelText('Loading root metadata...');
  await screen.findByRole('treeitem', { name: 'entities' });

  return {
    user,
    ...renderResult,

    selectExplorerNode: async (name) => {
      const item = await screen.findByRole('treeitem', {
        name: new RegExp(`^${name}(?: \\(NeXus group\\))?$`, 'u'), // account for potential NeXus badge
      });

      await user.click(item);
    },

    selectVisTab: async (name) => {
      await user.click(await screen.findByRole('tab', { name }));
    },
  };
}

async function findVisSelector(): Promise<HTMLElement> {
  return screen.findByRole('tablist', { name: 'Visualization' });
}

export async function findVisTabs(): Promise<string[]> {
  return within(await findVisSelector())
    .getAllByRole('tab')
    .map((tab) => {
      assertNonNull(tab.textContent);
      return tab.textContent;
    });
}

export async function findSelectedVisTab(): Promise<string> {
  const selectedTab = within(await findVisSelector())
    .getAllByRole('tab')
    .find((tab) => tab.getAttribute('aria-selected') === 'true');

  assertDefined(selectedTab);
  assertNonNull(selectedTab.textContent);
  return selectedTab.textContent;
}

/**
 * Mock console method in test.
 * Mocks are automatically restored after every test, but to restore
 * the original console method earlier, call `spy.mockRestore()`.
 */
export function mockConsoleMethod(
  method: 'log' | 'warn' | 'error',
  debug?: boolean
) {
  const spy = jest.spyOn(console, method);
  spy.mockImplementation((...args) => {
    if (debug) {
      console.debug(...args); // eslint-disable-line no-console
    }
  });
  return spy;
}
