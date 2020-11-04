import React from 'react';
import { render, RenderResult } from '@testing-library/react';
import App from './App';
import MockProvider from './providers/mock/MockProvider';

export function renderApp(): RenderResult {
  return render(
    <MockProvider>
      <App />
    </MockProvider>
  );
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
    consoleError: mock,
    resetConsole: () => {
      console.error = original;
    },
  };
}
/* eslint-enable no-console */
