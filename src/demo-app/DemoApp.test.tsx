import React from 'react';
import { render } from '@testing-library/react';
import DemoApp from './DemoApp';

test('renders', () => {
  const { getByText } = render(<DemoApp />);
  const elem = getByText(/No entity/i);
  expect(elem).toBeInTheDocument();
});
