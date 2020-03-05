import React from 'react';
import { render } from '@testing-library/react';
import DemoApp from './DemoApp';

test('renders', async () => {
  const { findByText } = render(<DemoApp />);
  const elem = await findByText(/No entity/i);
  expect(elem).toBeInTheDocument();
});
