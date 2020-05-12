import React from 'react';
import { render } from '@testing-library/react';
import App from './App';
import MockProvider from './providers/mock/MockProvider';

const DOMAIN = 'bsa_002_000-integrate-sub';

test('renders with root group selected', async () => {
  const { findByText, findByRole } = render(
    <MockProvider domain={DOMAIN}>
      <App />
    </MockProvider>
  );

  const noVisText = await findByText('Nothing to visualize');
  expect(noVisText).toBeInTheDocument();

  const title = await findByRole('heading', { name: DOMAIN });
  expect(title).toBeInTheDocument();

  const domainBtn = await findByRole('treeitem', { name: DOMAIN });
  expect(domainBtn).toHaveAttribute('aria-selected', 'true');
});
