import { screen } from '@testing-library/react';

import { getSelectedVisTab, renderApp } from '../test-utils';
import { Vis } from '../vis-packs/core/visualizations';

test('switch between visualizations', async () => {
  const { user } = await renderApp('/nD_datasets/oneD');

  const lineTab = screen.getByRole('tab', { name: 'Line' });
  expect(lineTab).toBeVisible();
  expect(lineTab).toHaveAttribute('aria-selected', 'true');

  const matrixTab = screen.getByRole('tab', { name: 'Matrix' });
  expect(matrixTab).toBeVisible();
  expect(matrixTab).toHaveAttribute('aria-selected', 'false');

  // Switch to Matrix visualization
  await user.click(matrixTab);
  expect(matrixTab).toHaveAttribute('aria-selected', 'true');
  expect(lineTab).toHaveAttribute('aria-selected', 'false');
});

test('restore active visualization when switching to inspect mode and back', async () => {
  const { user, selectVisTab } = await renderApp('/nD_datasets/twoD');

  // Switch to Line visualization
  await selectVisTab(Vis.Line);

  // Switch to inspect mode and back
  await user.click(screen.getByRole('tab', { name: 'Inspect' }));
  await user.click(screen.getByRole('tab', { name: 'Display' }));

  // Ensure Line visualization is active
  expect(getSelectedVisTab()).toBe('Line');
});

test('choose most advanced visualization when switching between datasets', async () => {
  const { selectExplorerNode } = await renderApp('/nD_datasets/oneD');

  expect(getSelectedVisTab()).toBe('Line');

  await selectExplorerNode('twoD');
  expect(getSelectedVisTab()).toBe(Vis.Heatmap);

  await selectExplorerNode('threeD_rgb');
  expect(getSelectedVisTab()).toBe(Vis.RGB);

  await selectExplorerNode('threeD_bool');
  expect(getSelectedVisTab()).toBe(Vis.Matrix);
});

test('remember preferred visualization when switching between datasets', async () => {
  const { user, selectExplorerNode, selectVisTab } = await renderApp(
    '/nD_datasets/twoD'
  );

  /* Switch to Matrix vis. Since this is _not_ the most advanced visualization
   * for `twoD`, it becomes the preferred visualization. */
  await selectVisTab(Vis.Matrix);
  expect(getSelectedVisTab()).toBe('Matrix');

  // Select another dataset for which the Matrix vis is not the most advanced visualization
  await selectExplorerNode('oneD');

  // Check that the preferred visualization is restored
  expect(getSelectedVisTab()).toBe(Vis.Matrix);

  /* Switch to Line vis. Since this _is_ the most advanced visualization for
   * `oneD`, the preferred visualization is cleared. */
  await user.click(screen.getByRole('tab', { name: 'Line' })); // becomes preferred vis

  // Select another dataset with a more advanced visualization than Line
  await selectExplorerNode('threeD_rgb');

  // Check that the most advanced visualization is selected
  expect(getSelectedVisTab()).toBe(Vis.RGB);
});
