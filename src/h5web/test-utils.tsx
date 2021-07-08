import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import MockProvider from './providers/mock/MockProvider';
import type { Vis } from './vis-packs/core/visualizations';

export async function renderApp(): Promise<void> {
  return act(async () => {
    render(
      <MockProvider>
        <App />
      </MockProvider>
    );
  });
}

export async function selectExplorerNode(path: string): Promise<void> {
  for await (const segment of path.split('/')) {
    userEvent.click(
      await screen.findByRole('treeitem', {
        name: new RegExp(`^${segment}(?: \\(NeXus group\\))?$`, 'u'), // account for potential NeXus badge
      })
    );
  }
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

export async function selectVisTab(name: Vis): Promise<void> {
  userEvent.click(await screen.findByRole('tab', { name }));
}

export function pressKey(key: string, downCount = 1) {
  const elem = document.activeElement || document.body; // https://testing-library.com/docs/guide-events#keydown

  for (let i = 0; i < downCount; i++) {
    fireEvent.keyDown(elem, { key });
  }

  fireEvent.keyUp(elem, { key });
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
