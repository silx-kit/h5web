import { expect, test } from 'vitest';
import { page } from 'vitest/browser';

import { renderApp } from '../test-utils';

test('visualize dataset with `valid_min` and/or `valid_max` attributes', async () => {
  const { selectExplorerNode } = await renderApp('/netcdf/valid_min');

  expect(page.getByLabelText('Min: 5e+0')).toBeVisible(); // valid_min
  expect(page.getByLabelText('Max: 4e+2')).toBeVisible(); // data max

  await selectExplorerNode('valid_max');
  expect(page.getByLabelText('Min: −9.5e+1')).toBeVisible(); // data min
  expect(page.getByLabelText('Max: 2e+2')).toBeVisible(); // valid_max

  await selectExplorerNode('valid_min_max');
  expect(page.getByLabelText('Min: 5e+0')).toBeVisible(); // valid_min
  expect(page.getByLabelText('Max: 2e+2')).toBeVisible(); // valid_max
});

test('visualize dataset with `valid_range` attribute', async () => {
  await renderApp('/netcdf/valid_range');

  expect(page.getByLabelText('Min: 5e+0')).toBeVisible(); // valid_range[0]
  expect(page.getByLabelText('Max: 2e+2')).toBeVisible(); // valid_range[1]
});

test('visualize dataset with `_FillValue` attribute', async () => {
  const { selectExplorerNode } = await renderApp('/netcdf/_FillValue');

  expect(page.getByLabelText('Min: −9.5e+1')).toBeVisible(); // data min
  expect(page.getByLabelText('Max: 9.9e+1')).toBeVisible(); // closest data value lower than _FillValue

  await selectExplorerNode('_FillValue (negative)');
  expect(page.getByLabelText('Min: −6e+0')).toBeVisible(); // closest data value greater than _FillValue
  expect(page.getByLabelText('Max: 4e+2')).toBeVisible(); // data max
});
