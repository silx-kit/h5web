import { screen } from '@testing-library/react';
import { expect, test } from 'vitest';

import { renderApp } from '../test-utils';

test('search for entities', async () => {
  const { user } = await renderApp();

  // Select "Search" tab
  await user.click(screen.getByRole('tab', { name: 'Search' }));
  expect(screen.queryByRole('treeitem')).toBeNull(); // no results yet

  // Type search text
  await user.type(screen.getByLabelText('Path to search'), 'empty');
  expect(screen.getAllByRole('treeitem')).toHaveLength(2); // two results

  // Select a result
  const itemToSelect = screen.getByRole('treeitem', {
    name: '/entities/empty_group',
  });
  await user.click(itemToSelect);
  expect(itemToSelect).toHaveAttribute('aria-selected', 'true');

  // Switch back to explorer and make sure result is still selected and visible
  await user.click(screen.getByRole('tab', { name: 'Explorer' }));

  const selectedItem = await screen.findByRole('treeitem', {
    name: 'empty_group',
  });
  expect(selectedItem).toHaveAttribute('aria-selected', 'true');
  expect(selectedItem).toBeVisible();
});
