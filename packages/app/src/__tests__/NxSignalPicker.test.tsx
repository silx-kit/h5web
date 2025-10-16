import { screen } from '@testing-library/react';
import { expect, test } from 'vitest';

import { getSelectedVisTab, renderApp, waitForAllLoaders } from '../test-utils';
import { NxDataVis } from '../vis-packs/nexus/visualizations';

test('pick auxiliary signal on NX Heatmap', async () => {
  const { user } = await renderApp('/nexus_entry/image_with_aux');
  expect(getSelectedVisTab()).toBe(NxDataVis.NxHeatmap);
  expect(screen.getByRole('figure', { name: 'twoD' })).toBeVisible();

  await user.click(screen.getByRole('button', { name: 'Signals' }));
  await user.click(screen.getByRole('radio', { name: 'tertiary' }));
  await waitForAllLoaders();

  expect(screen.getByRole('figure', { name: 'tertiary' })).toBeVisible();
});
