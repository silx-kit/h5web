import { assertDefined, assertNonNull } from '@h5web/shared/guards';
import {
  render,
  type RenderResult,
  screen,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, type MockInstance, vi } from 'vitest';

import App from './App';
import MockProvider from './providers/mock/MockProvider';
import { type Vis } from './vis-packs/core/visualizations';
import { type NexusVis } from './vis-packs/nexus/visualizations';

interface RenderAppResult extends RenderResult {
  user: ReturnType<typeof userEvent.setup>;
  selectExplorerNode: (name: string) => Promise<void>;
  selectVisTab: (name: Vis | NexusVis) => Promise<void>;
}

type InitialPath = `/${string}`;
interface RenderAppOpts {
  initialPath?: InitialPath;
  preferredVis?: Vis | undefined;
  withFakeTimers?: boolean;
}

export async function renderApp(
  opts: InitialPath | RenderAppOpts = '/',
): Promise<RenderAppResult> {
  const optsObj = typeof opts === 'string' ? { initialPath: opts } : opts;
  const { initialPath, preferredVis, withFakeTimers }: RenderAppOpts = {
    initialPath: '/',
    ...optsObj,
  };

  if (preferredVis) {
    globalThis.localStorage.setItem(
      'h5web:preferredVis',
      JSON.stringify(preferredVis),
    );
  }

  if (withFakeTimers) {
    vi.useFakeTimers();

    // @ts-expect-error - Workaround for React Testing Library's reliance on Jest
    // https://github.com/testing-library/react-testing-library/issues/1197
    globalThis.jest = { advanceTimersByTime: vi.advanceTimersByTime.bind(vi) };
  }

  const user = userEvent.setup(
    withFakeTimers
      ? { advanceTimers: vi.advanceTimersByTime.bind(vi) }
      : undefined,
  );

  const renderResult = render(
    <MockProvider>
      <App initialPath={initialPath} />
    </MockProvider>,
  );

  if (!withFakeTimers) {
    await waitForAllLoaders();
  }

  return {
    user,
    ...renderResult,

    selectExplorerNode: async (name) => {
      const item = await screen.findByRole('treeitem', {
        name: new RegExp(`^${name}(?: \\(NeXus group\\))?$`, 'u'), // account for potential NeXus badge
      });

      await user.click(item);

      if (!withFakeTimers) {
        await waitForAllLoaders();
      }
    },

    selectVisTab: async (name) => {
      await user.click(await screen.findByRole('tab', { name }));

      if (!withFakeTimers) {
        await waitForAllLoaders();
      }
    },
  };
}

export async function waitForAllLoaders(): Promise<void> {
  await vi.waitFor(() => {
    expect(screen.queryAllByTestId(/^Loading/u)).toHaveLength(0);
  });
}

function getVisSelector(): HTMLElement {
  return screen.getByRole('tablist', { name: 'Visualization' });
}

export function getVisTabs(): string[] {
  return within(getVisSelector())
    .getAllByRole('tab')
    .map((tab) => {
      assertNonNull(tab.textContent);
      return tab.textContent;
    });
}

export function getSelectedVisTab(): string {
  const selectedTab = within(getVisSelector())
    .getAllByRole('tab')
    .find((tab) => tab.getAttribute('aria-selected') === 'true');

  assertDefined(selectedTab);
  assertNonNull(selectedTab.textContent);
  return selectedTab.textContent;
}

export function getDimMappingBtn(axis: 'x' | 'y', dim: number): HTMLElement {
  const radioGroup = screen.getByLabelText(`Dimension as ${axis} axis`);
  return within(radioGroup).getByRole('radio', { name: `D${dim}` });
}

/**
 * Mock a console method.
 * Mocks are automatically cleared and restored after every test but you
 * may also call `clearMock()` or `restoreMock()` yourself sooner as needed.
 */
export function mockConsoleMethod(
  method: 'log' | 'warn' | 'error',
  debug?: boolean,
): MockInstance {
  return vi.spyOn(console, method).mockImplementation((...args) => {
    if (debug) {
      console.debug(...args); // eslint-disable-line no-console
    }
  });
}

export async function assertListeningAt(
  url: string,
  message = `Expected server listening at ${url}`,
) {
  try {
    await fetch(url);
  } catch (error) {
    throw new Error(message, { cause: error });
  }
}
