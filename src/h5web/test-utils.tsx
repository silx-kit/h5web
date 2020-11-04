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
import { Vis } from './visualizations';

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
 * Mock `console.error` method in test.
 * Call returned `resetConsole` function to restore original method.
 */
/* eslint-disable no-console */
export function prepareForConsoleError() {
  const original = console.error;

  const mock = jest.fn();
  console.error = mock;

  return {
    consoleErrorMock: mock,
    resetConsole: () => {
      console.error = original;
    },
  };
}
/* eslint-enable no-console */
