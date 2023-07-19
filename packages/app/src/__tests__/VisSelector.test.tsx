import { screen } from '@testing-library/react';

import { findSelectedVisTab, renderApp } from '../test-utils';
import { Vis } from '../vis-packs/core/visualizations';

test('switch between visualizations', async () => {
  const { user } = await renderApp('/nD_datasets/oneD');

  const lineTab = await screen.findByRole('tab', { name: 'Line' });
  expect(lineTab).toBeVisible();
  expect(lineTab).toHaveAttribute('aria-selected', 'true');

  const matrixTab = screen.getByRole('tab', { name: 'Matrix' });
  expect(matrixTab).toBeVisible();
  expect(matrixTab).toHaveAttribute('aria-selected', 'false');

  // Switch to Matrix visualization
  await user.click(matrixTab);

  expect(screen.getByRole('tab', { name: 'Matrix' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  expect(screen.getByRole('tab', { name: 'Line' })).toHaveAttribute(
    'aria-selected',
    'false',
  );
});

test('restore active visualization when switching to inspect mode and back', async () => {
  const { user, selectVisTab } = await renderApp('/nD_datasets/twoD');

  // Switch to Line visualization
  await selectVisTab(Vis.Line);

  // Switch to inspect mode and back
  await user.click(await screen.findByRole('tab', { name: 'Inspect' }));
  await user.click(await screen.findByRole('tab', { name: 'Display' }));

  await expect(
    screen.findByRole('tab', { name: 'Line' }),
  ).resolves.toHaveAttribute('aria-selected', 'true');
});

test('choose most advanced visualization when switching between datasets', async () => {
  const { selectExplorerNode } = await renderApp('/nD_datasets/oneD');

  await expect(
    screen.findByRole('tab', { name: 'Line' }),
  ).resolves.toHaveAttribute('aria-selected', 'true');

  await selectExplorerNode('twoD');
  await expect(
    screen.findByRole('tab', { name: 'Heatmap' }),
  ).resolves.toHaveAttribute('aria-selected', 'true');

  await selectExplorerNode('threeD_rgb');
  await expect(
    screen.findByRole('tab', { name: 'RGB' }),
  ).resolves.toHaveAttribute('aria-selected', 'true');

  await selectExplorerNode('threeD_bool');
  await expect(
    screen.findByRole('tab', { name: 'Matrix' }),
  ).resolves.toHaveAttribute('aria-selected', 'true');
});

test('remember preferred visualization when switching between datasets', async () => {
  const { user, selectExplorerNode, selectVisTab } = await renderApp(
    '/nD_datasets/twoD',
  );

  /* Switch to Matrix vis. Since this is _not_ the most advanced visualization
   * for `twoD`, it becomes the preferred visualization. */
  await selectVisTab(Vis.Matrix);
  await expect(findSelectedVisTab()).resolves.toBe('Matrix');

  // Select another dataset for which the Matrix vis is not the most advanced visualization
  await selectExplorerNode('oneD');

  // Check that the preferred visualization is restored
  await expect(
    screen.findByRole('tab', { name: 'Matrix' }),
  ).resolves.toHaveAttribute('aria-selected', 'true');
  await expect(findSelectedVisTab()).resolves.toBe('Matrix');

  /* Switch to Line vis. Since this _is_ the most advanced visualization for
   * `oneD`, the preferred visualization is cleared. */
  await user.click(await screen.findByRole('tab', { name: 'Line' })); // becomes preferred vis

  // Select another dataset with a more advanced visualization than Line
  await selectExplorerNode('threeD_rgb');

  // Check that the most advanced visualization is selected
  await expect(
    screen.findByRole('tab', { name: 'RGB' }),
  ).resolves.toHaveAttribute('aria-selected', 'true');
  await expect(findSelectedVisTab()).resolves.toBe('RGB');
});
