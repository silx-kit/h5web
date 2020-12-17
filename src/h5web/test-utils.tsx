import React from 'react';
import {
  fireEvent,
  render,
  RenderResult,
  screen,
  within,
} from '@testing-library/react';
import App from './App';
import MockProvider from './providers/mock/MockProvider';
import type { Vis } from './visualizations';

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

export async function selectVisTab(vis: Vis): Promise<void> {
  fireEvent.click(await screen.findByRole('tab', { name: vis }));
}

/**
 * Mock console method in test.
 * To restore original method, call `resetConsole`.
 */
/* eslint-disable no-console */
export function mockConsoleMethod(method: keyof typeof console) {
  const original = console[method];

  const mock = jest.fn();
  console[method] = mock;

  return {
    consoleMock: mock,
    resetConsole: () => {
      console[method] = original;
    },
  };
}
/* eslint-enable no-console */
