import { expect, test } from 'vitest';
import { page } from 'vitest/browser';

import { renderApp } from '../test-utils';

test('search for entities', async () => {
  await renderApp();

  // Select "Search" tab
  await page.getByRole('tab', { name: 'Search' }).click();
  expect(page.getByRole('treeitem')).not.toBeInTheDocument(); // no results yet

  // Type search text
  await page.getByLabelText('Path to search').fill('empty');
  expect(page.getByRole('treeitem')).toHaveLength(2); // two results

  // Select a result
  const itemToSelect = page.getByRole('treeitem', {
    name: '/entities/empty_group',
  });
  await itemToSelect.click();
  expect(itemToSelect).toHaveAttribute('aria-selected', 'true');

  // Switch back to explorer and make sure result is still selected and visible
  await page.getByRole('tab', { name: 'Explorer' }).click();

  const selectedItem = page.getByRole('treeitem', { name: 'empty_group' });
  await expect.element(selectedItem).toBeVisible();
  expect(selectedItem).toHaveAttribute('aria-selected', 'true');
});
