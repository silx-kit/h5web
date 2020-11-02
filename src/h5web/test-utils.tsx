import React from 'react';
import { render, RenderResult } from '@testing-library/react';
import App from './App';
import MockProvider from './providers/mock/MockProvider';

export const DOMAIN = 'source.h5';

export function renderApp(): RenderResult {
  return render(
    <MockProvider domain={DOMAIN}>
      <App />
    </MockProvider>
  );
}
