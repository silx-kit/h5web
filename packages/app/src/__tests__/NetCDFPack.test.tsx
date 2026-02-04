import { screen, within } from '@testing-library/react';
import { expect, test } from 'vitest';

import { renderApp } from '../test-utils';

test('visualize dataset with `valid_min` and/or `valid_max` attributes', async () => {
  const { selectExplorerNode } = await renderApp('/netcdf/valid_min');

  const fig1 = screen.getByRole('figure', { name: 'valid_min' });
  expect(within(fig1).getByText('4e+2')).toBeVisible(); // data max
  expect(within(fig1).getByText('5e+0')).toBeVisible(); // valid_min

  await selectExplorerNode('valid_max');
  const fig2 = screen.getByRole('figure', { name: 'valid_max' });
  expect(within(fig2).getByText('2e+2')).toBeVisible(); // valid_max
  expect(within(fig2).getByText('−9.5e+1')).toBeVisible(); // data min

  await selectExplorerNode('valid_min_max');
  const fig3 = screen.getByRole('figure', { name: 'valid_min_max' });
  expect(within(fig3).getByText('2e+2')).toBeVisible(); // valid_max
  expect(within(fig3).getByText('5e+0')).toBeVisible(); // valid_min
});

test('visualize dataset with `valid_range` attribute', async () => {
  await renderApp('/netcdf/valid_range');

  const fig = screen.getByRole('figure', { name: 'valid_range' });
  expect(within(fig).getByText('2e+2')).toBeVisible(); // valid_range[1]
  expect(within(fig).getByText('5e+0')).toBeVisible(); // valid_range[0]
});

test('visualize dataset with `_FillValue` attribute', async () => {
  const { selectExplorerNode } = await renderApp('/netcdf/_FillValue');

  const fig1 = screen.getByRole('figure', { name: '_FillValue' });
  expect(within(fig1).getByText('9.9e+1')).toBeVisible(); // closest data value lower than _FillValue
  expect(within(fig1).getByText('−9.5e+1')).toBeVisible(); // data min

  await selectExplorerNode('_FillValue (negative)', true);
  const fig2 = screen.getByRole('figure', { name: '_FillValue (negative)' });
  expect(within(fig2).getByText('4e+2')).toBeVisible(); // data max
  expect(within(fig2).getByText('−6e+0')).toBeVisible(); // closest data value greater than _FillValue
});
