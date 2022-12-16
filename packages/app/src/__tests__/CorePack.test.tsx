import { mockValues } from '@h5web/shared';
import { screen } from '@testing-library/react';

import {
  findVisSelectorTabs,
  mockConsoleMethod,
  renderApp,
} from '../test-utils';
import { Vis } from '../vis-packs/core/visualizations';

test('visualise raw dataset', async () => {
  await renderApp('/entities/raw');

  const tabs = await findVisSelectorTabs();
  expect(tabs).toHaveLength(1);
  expect(tabs[0]).toHaveTextContent(Vis.Raw);
  expect(tabs[0]).toHaveAttribute('aria-selected', 'true');

  await expect(screen.findByText(/"int": 42/)).resolves.toBeVisible();
});

test('log raw dataset to console if too large', async () => {
  const logSpy = mockConsoleMethod('log');
  await renderApp('/entities/raw_large');

  await expect(screen.findByText(/dataset is too big/)).resolves.toBeVisible();
  expect(logSpy).toHaveBeenCalledWith(mockValues.raw_large);
});

test('visualise scalar dataset', async () => {
  // Integer scalar
  const { selectExplorerNode } = await renderApp('/entities/scalar_int');

  await expect(screen.findByText('0')).resolves.toBeVisible();

  const tabs = await findVisSelectorTabs();
  expect(tabs).toHaveLength(1);
  expect(tabs[0]).toHaveTextContent(Vis.Scalar);
  expect(tabs[0]).toHaveAttribute('aria-selected', 'true');

  // String scalar
  await selectExplorerNode('scalar_str');
  await expect(screen.findByText(mockValues.scalar_str)).resolves.toBeVisible();
});

test('visualize 1D dataset', async () => {
  await renderApp('/nD_datasets/oneD');

  const tabs = await findVisSelectorTabs();
  expect(tabs).toHaveLength(2);
  expect(tabs[0]).toHaveTextContent(Vis.Matrix);
  expect(tabs[1]).toHaveTextContent(Vis.Line);
  expect(tabs[1]).toHaveAttribute('aria-selected', 'true');

  await expect(
    screen.findByRole('figure', { name: 'oneD' })
  ).resolves.toBeVisible();
});

test('visualize 2D datasets', async () => {
  await renderApp('/nD_datasets/twoD');

  const tabs = await findVisSelectorTabs();
  expect(tabs).toHaveLength(3);
  expect(tabs[0]).toHaveTextContent(Vis.Matrix);
  expect(tabs[1]).toHaveTextContent(Vis.Line);
  expect(tabs[2]).toHaveTextContent(Vis.Heatmap);
  expect(tabs[2]).toHaveAttribute('aria-selected', 'true');

  await expect(
    screen.findByRole('figure', { name: 'twoD' })
  ).resolves.toBeVisible();
});

test('visualize 1D slice of a 3D dataset as Line with and without autoscale', async () => {
  jest.useFakeTimers();
  const { user } = await renderApp({
    initialPath: '/resilience/slow_slicing',
    preferredVis: Vis.Line,
  });

  // Wait for slice loader to appear (since autoscale is on by default, only the first slice gets fetched)
  await expect(
    screen.findByText(/Loading current slice/)
  ).resolves.toBeVisible();

  // Wait for fetch of first slice to succeed
  jest.runAllTimers();
  await expect(screen.findByRole('figure')).resolves.toBeVisible();

  // Confirm that autoscale is indeed on
  const autoScaleBtn = screen.getByRole('button', { name: 'Auto-scale' });
  expect(autoScaleBtn).toHaveAttribute('aria-pressed', 'true');

  // Move to next slice
  const d0Slider = screen.getByRole('slider', { name: 'D0' });
  await user.type(d0Slider, '{ArrowUp}');

  // Wait for slice loader to re-appear after debounce
  await expect(
    screen.findByText(/Loading current slice/)
  ).resolves.toBeVisible();

  // Wait for fetch of second slice to succeed
  jest.runAllTimers();
  await expect(screen.findByRole('figure')).resolves.toBeVisible();

  // Activate autoscale
  await user.click(autoScaleBtn);

  // Now, the entire dataset gets fetched
  await expect(
    screen.findByText(/Loading entire dataset/)
  ).resolves.toBeVisible();

  // Wait for fetch of entire dataset to succeed
  jest.runAllTimers();
  await expect(screen.findByRole('figure')).resolves.toBeVisible();

  // Move to third slice
  await user.type(d0Slider, '{ArrowUp}');

  // Wait for new slicing to apply to Line visualization to confirm that no more slow fetching is performed
  await expect(screen.findByTestId('2,0,x', undefined)).resolves.toBeVisible();
  d0Slider.blur(); // remove focus to avoid state update after unmount

  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

test('show interactions help for heatmap according to "keep ratio"', async () => {
  const { user } = await renderApp();

  const helpBtn = await screen.findByRole('button', { name: 'Show help' });
  const keepRatioBtn = await screen.findByRole('button', {
    name: 'Keep ratio',
  });

  // By default, "keep ratio" should be enabled
  expect(keepRatioBtn).toHaveAttribute('aria-pressed', 'true');

  // Since "keep ratio" is enabled, only basic interactions should be available (no axial-zoom interactions)
  await user.click(helpBtn);

  await expect(screen.findByText('Pan')).resolves.toBeVisible();
  await expect(screen.findByText('Select to zoom')).resolves.toBeVisible();
  await expect(screen.findByText('Zoom')).resolves.toBeVisible();

  expect(screen.queryByText(/zoom in x/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/zoom in y/i)).not.toBeInTheDocument();

  // Toggle "keep ratio" and check that axial-zoom interactions are now available
  await user.click(keepRatioBtn);
  await user.click(helpBtn);

  await expect(screen.findByText('Zoom in X')).resolves.toBeVisible();
  await expect(screen.findByText('Zoom in Y')).resolves.toBeVisible();
  await expect(screen.findByText('Select to zoom in X')).resolves.toBeVisible();
  await expect(screen.findByText('Select to zoom in Y')).resolves.toBeVisible();
});
