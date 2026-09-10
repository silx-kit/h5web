import { expect, test } from 'vitest';
import { page } from 'vitest/browser';

import {
  getAxis,
  getDimMappingBtn,
  mockConsoleMethod,
  mockDelay,
  renderApp,
} from '../test-utils';

test('plot 1D dataset against its attached dimension scale', async () => {
  await renderApp('/dimension_scales/oneD');

  const abscissa = await getAxis('abscissa');

  // Label combines the dimension label and the scale's `units` attribute
  expect(abscissa.getByText('position (nm)')).toBeVisible();

  // Abscissa spans the scale's values (-20 to 20) rather than the indices (0 to 40)
  expect(abscissa.getByText('−20', { exact: true })).toBeVisible();
  expect(abscissa.getByText('20', { exact: true })).toBeVisible();
});

test('fall back to the scale name when the dimension has no label', async () => {
  await renderApp('/dimension_scales/oneD_named_scale');

  // `abscissa` is the scale's `NAME` attribute; the scale dataset is called `X_named`
  const abscissa = await getAxis('abscissa');
  expect(abscissa.getByText('abscissa (nm)')).toBeVisible();
});

test('name the dimension even when no scale is attached', async () => {
  await renderApp('/dimension_scales/oneD_label_only');

  // The label is shown as a hint on the axis mapper button...
  expect(getDimMappingBtn('x', 0)).toHaveAttribute('title', 'position');

  // ...but with no scale to plot against, the abscissa stays the index axis
  const abscissa = await getAxis('abscissa');
  expect(abscissa.getByText('40', { exact: true })).toBeVisible(); // last index
  expect(abscissa.getByText('−20', { exact: true })).not.toBeInTheDocument();
});

test('skip an unusable scale for a usable one on the same dimension', async () => {
  await renderApp('/dimension_scales/oneD_multi_scale');

  /* `Y` is attached first but is the wrong length, so `X` is used. Falling back
   * to indices here would discard a scale the file does provide. */
  const abscissa = await getAxis('abscissa');
  expect(abscissa.getByText('−20', { exact: true })).toBeVisible(); // an `X` value
  expect(abscissa.getByText('40', { exact: true })).not.toBeInTheDocument(); // last index
});

test('skip a scale whose values cannot be read', async () => {
  await renderApp('/dimension_scales/oneD_unreadable_scale');

  // Loading the first scale fails, so the second one is plotted rather than the indices
  const abscissa = await getAxis('abscissa');
  expect(abscissa.getByText('−20', { exact: true })).toBeVisible(); // an `X` value
  expect(abscissa.getByText('40', { exact: true })).not.toBeInTheDocument(); // last index
});

test('show error rather than index axis when a scale fails to fetch', async () => {
  const errorSpy = mockConsoleMethod('error');
  await renderApp('/dimension_scales/oneD_fetcher_error_scale');

  // A fetch error says nothing about the scale, so neither the next scale nor the indices are plotted
  await expect
    .element(page.getByText('Request failed: 502 Bad Gateway'))
    .toBeVisible();
  expect(page.getByRole('figure')).not.toBeInTheDocument();
  errorSpy.mockRestore();
});

test('refetch scale cancelled by selecting another entity', async () => {
  const runAll = mockDelay();
  const { selectExplorerNode } = await renderApp({
    initialPath: '/dimension_scales/oneD_slow_scale',
    waitForLoaders: false,
  });

  // Selecting another entity cancels the scale fetch
  await selectExplorerNode('X');
  await expect.element(page.getByRole('figure')).toBeVisible();

  // Selecting the dataset again must not plot it against the index axis
  const errorSpy = mockConsoleMethod('error');
  await selectExplorerNode('oneD_slow_scale');
  await expect.element(page.getByText('Request cancelled')).toBeVisible();
  errorSpy.mockRestore();

  await page.getByRole('button', { name: 'Retry?' }).click();

  runAll();
  const abscissa = await getAxis('abscissa');
  expect(abscissa.getByText('−20', { exact: true })).toBeVisible(); // a `slow_X` value
  expect(abscissa.getByText('40', { exact: true })).not.toBeInTheDocument(); // last index
});

test('plot 2D dataset against the scale attached to its last dimension', async () => {
  await renderApp('/dimension_scales/twoD');

  const abscissa = await getAxis('abscissa');
  expect(abscissa.getByText('column (nm)')).toBeVisible();
  expect(abscissa.getByText('−20', { exact: true })).toBeVisible(); // an `X` value

  // The first dimension has neither scale nor label, so it stays unnamed
  expect(getDimMappingBtn('y', 0)).not.toHaveAttribute('title');
});

test('keep ratio by default only when both axes share a unit', async () => {
  // `Y_nm` and `X` are both in nanometres, so the image keeps its ratio...
  await renderApp('/dimension_scales/twoD_same_units');
  const keepRatioBtn = page.getByRole('button', { name: 'Keep ratio' });
  expect(keepRatioBtn).toHaveAttribute('aria-pressed', 'true');

  // ...but the user can still turn it off
  await keepRatioBtn.click();
  expect(keepRatioBtn).toHaveAttribute('aria-pressed', 'false');
});

test('fill the canvas by default when the axes have different units', async () => {
  // Time against length: keeping the ratio would squash the image into a line
  await renderApp('/dimension_scales/twoD_diff_units');
  const keepRatioBtn = page.getByRole('button', { name: 'Keep ratio' });
  expect(keepRatioBtn).toHaveAttribute('aria-pressed', 'false');

  // The suggestion does not override the user's choice, even when remapping the axes
  await keepRatioBtn.click();
  expect(keepRatioBtn).toHaveAttribute('aria-pressed', 'true');

  await getDimMappingBtn('x', 0).click();
  expect(keepRatioBtn).toHaveAttribute('aria-pressed', 'true');
});

test('plot complex dataset against its attached dimension scale', async () => {
  await renderApp('/dimension_scales/oneD_complex');

  // Scales reach every core visualization with axes, not just line and heatmap
  const abscissa = await getAxis('abscissa');
  expect(abscissa.getByText('time (ms)')).toBeVisible();
  expect(abscissa.getByText('100', { exact: true })).toBeVisible(); // last `T` value
});
