import {
  fireEvent,
  render,
  RenderResult,
  screen,
  within,
} from '@testing-library/react';
import App from './App';
import MockProvider from './providers/mock/MockProvider';
import type { Vis } from './vis-packs/core/visualizations';

export function renderApp(): RenderResult {
  return render(
    <MockProvider>
      <App />
    </MockProvider>
  );
}

export async function selectExplorerNode(path: string): Promise<void> {
  for await (const name of path.split('/')) {
    fireEvent.click(await screen.findByRole('treeitem', { name }));
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
  fireEvent.click(await screen.findByRole('tab', { name }));
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
