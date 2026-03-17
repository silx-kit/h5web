import { expect, test } from 'vitest';
import { page } from 'vitest/browser';

import { getSelectedVisTab, renderApp, waitForAllLoaders } from '../test-utils';
import { NxDataVis } from '../vis-packs/nexus/visualizations';

test('pick auxiliary signal on NX Line', async () => {
  await renderApp('/nexus_entry/spectrum_with_aux');
  expect(getSelectedVisTab()).toBe(NxDataVis.NxLine);
  expect(page.getByRole('figure', { name: 'twoD (arb. units)' })).toBeVisible();

  await page.getByRole('button', { name: 'Signals' }).click();
  await page.getByRole('checkbox', { name: 'secondary' }).click();
  await page.getByRole('checkbox', { name: 'tertiary_cplx' }).click();
  await waitForAllLoaders();

  expect(
    page.getByRole('checkbox', { name: 'Auxiliary signals' }),
  ).not.toBeChecked();
});

test('pick auxiliary signal on NX Heatmap', async () => {
  await renderApp('/nexus_entry/image_with_aux');
  expect(getSelectedVisTab()).toBe(NxDataVis.NxHeatmap);
  expect(page.getByRole('figure', { name: 'twoD' })).toBeVisible();

  await page.getByRole('button', { name: 'Signals' }).click();
  await page.getByRole('radio', { name: 'tertiary' }).click();
  await waitForAllLoaders();

  expect(page.getByRole('figure', { name: 'tertiary' })).toBeVisible();
});
