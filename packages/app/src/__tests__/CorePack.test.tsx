import { mockValues } from '@h5web/shared';
import { screen, within } from '@testing-library/react';

import { SLOW_TIMEOUT } from '../providers/mock/mock-api';
import {
  getVisTabs,
  getSelectedVisTab,
  mockConsoleMethod,
  renderApp,
} from '../test-utils';
import { Vis } from '../vis-packs/core/visualizations';

test('visualize raw dataset', async () => {
  await renderApp('/entities/raw');

  expect(getVisTabs()).toEqual([Vis.Raw]);
  expect(getSelectedVisTab()).toBe(Vis.Raw);
  expect(screen.getByText(/"int": 42/)).toBeVisible();
});

test('log raw dataset to console if too large', async () => {
  const logSpy = mockConsoleMethod('log');
  await renderApp('/entities/raw_large');

  expect(screen.getByText(/dataset is too big/)).toBeVisible();
  expect(logSpy).toHaveBeenCalledWith(mockValues.raw_large);
});

test('visualize scalar dataset', async () => {
  // Integer scalar
  const { selectExplorerNode } = await renderApp('/entities/scalar_int');

  expect(getVisTabs()).toEqual([Vis.Scalar]);
  expect(getSelectedVisTab()).toBe(Vis.Scalar);
  expect(screen.getByText('0')).toBeVisible();

  // String scalar
  await selectExplorerNode('scalar_str');

  expect(getVisTabs()).toEqual([Vis.Scalar]);
  expect(getSelectedVisTab()).toBe(Vis.Scalar);
  expect(screen.getByText('foo')).toBeVisible();
});

test('visualize 1D dataset', async () => {
  await renderApp('/nD_datasets/oneD');

  expect(getVisTabs()).toEqual([Vis.Matrix, Vis.Line]);
  expect(getSelectedVisTab()).toBe(Vis.Line);
  expect(screen.getByRole('figure', { name: 'oneD' })).toBeVisible();
});

test('visualize 1D complex dataset', async () => {
  await renderApp('/nD_datasets/oneD_cplx');

  expect(getVisTabs()).toEqual([Vis.Matrix, Vis.Line]);
  expect(getSelectedVisTab()).toBe(Vis.Line);
  expect(screen.getByRole('figure', { name: 'oneD_cplx' })).toBeVisible();
});

test('visualize 2D dataset', async () => {
  await renderApp('/nD_datasets/twoD');

  expect(getVisTabs()).toEqual([Vis.Matrix, Vis.Line, Vis.Heatmap]);
  expect(getSelectedVisTab()).toBe(Vis.Heatmap);

  const figure = screen.getByRole('figure', { name: 'twoD' });
  expect(figure).toBeVisible();
  expect(within(figure).getByText('4e+2')).toBeVisible(); // color bar limit
});

test('visualize 2D complex dataset', async () => {
  const { user } = await renderApp('/nD_datasets/twoD_cplx');

  expect(getVisTabs()).toEqual([Vis.Matrix, Vis.Line, Vis.Heatmap]);
  expect(getSelectedVisTab()).toBe(Vis.Heatmap);

  const figure = screen.getByRole('figure', { name: 'twoD_cplx (amplitude)' });
  expect(figure).toBeVisible();
  expect(within(figure).getByText('5e+0')).toBeVisible(); // color bar limit

  const selector = screen.getByRole('button', { name: '𝓐 Amplitude' });
  await user.click(selector);
  const phaseItem = screen.getByRole('menuitem', { name: 'φ Phase' });
  await user.click(phaseItem);

  expect(
    screen.getByRole('figure', { name: 'twoD_cplx (phase)' })
  ).toBeVisible();
});

test('visualize 1D slice of 3D dataset as Line with and without autoscale', async () => {
  const { user } = await renderApp({
    initialPath: '/resilience/slow_slicing',
    preferredVis: Vis.Line,
    withFakeTimers: true,
  });

  // Wait for slice loader to appear (since autoscale is on by default, only the first slice gets fetched)
  await expect(
    screen.findByText(/Loading current slice/)
  ).resolves.toBeVisible();

  // Wait for fetch of first slice to succeed
  await expect(
    screen.findByRole('figure', undefined, { timeout: SLOW_TIMEOUT })
  ).resolves.toBeVisible();

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
  await expect(
    screen.findByRole('figure', undefined, { timeout: SLOW_TIMEOUT })
  ).resolves.toBeVisible();

  // Activate autoscale
  await user.click(autoScaleBtn);

  // Now, the entire dataset gets fetched
  await expect(
    screen.findByText(/Loading entire dataset/)
  ).resolves.toBeVisible();

  // Wait for fetch of entire dataset to succeed
  await expect(
    screen.findByRole('figure', undefined, { timeout: SLOW_TIMEOUT })
  ).resolves.toBeVisible();

  // Move to third slice
  await user.type(d0Slider, '{ArrowUp}');

  // Wait for new slicing to apply to Line visualization to confirm that no more slow fetching is performed
  await expect(screen.findByTestId('2,0,x', undefined)).resolves.toBeVisible();
});
