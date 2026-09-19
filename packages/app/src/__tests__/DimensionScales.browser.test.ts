import { expect, test } from 'vitest';

import { getAxis, getDimMappingBtn, renderApp } from '../test-utils';

test('plot 1D dataset against its attached dimension scale', async () => {
  await renderApp('/dimension_scales/oneD');

  const abscissa = getAxis('abscissa');

  // Label combines the dimension label and the scale's `units` attribute
  expect(abscissa.getByText('position (nm)')).toBeVisible();

  // Abscissa spans the scale's values (-20 to 20) rather than the indices (0 to 40)
  expect(abscissa.getByText('−20', { exact: true })).toBeVisible();
  expect(abscissa.getByText('20', { exact: true })).toBeVisible();
});

test('fall back to the scale name when the dimension has no label', async () => {
  await renderApp('/dimension_scales/oneD_named_scale');

  // `abscissa` is the scale's own name; the scale dataset is called `X`
  expect(getAxis('abscissa').getByText('abscissa (nm)')).toBeVisible();
});

test('name the dimension even when no scale is attached', async () => {
  await renderApp('/dimension_scales/oneD_label_only');

  // The label is shown as a hint on the axis mapper button...
  expect(getDimMappingBtn('x', 0)).toHaveAttribute('title', 'position');

  // ...but with no scale to plot against, the abscissa stays the index axis
  const abscissa = getAxis('abscissa');
  expect(abscissa.getByText('40', { exact: true })).toBeVisible(); // last index
  expect(abscissa.getByText('−20', { exact: true })).not.toBeInTheDocument();
});

test('skip an unusable scale for a usable one on the same dimension', async () => {
  await renderApp('/dimension_scales/oneD_multi_scale');

  /* `Y` is attached first but is the wrong length, so `X` is used. Falling back
   * to indices here would discard a scale the file does provide. */
  const abscissa = getAxis('abscissa');
  expect(abscissa.getByText('−20', { exact: true })).toBeVisible(); // an `X` value
  expect(abscissa.getByText('40', { exact: true })).not.toBeInTheDocument(); // last index
});

test('plot 2D dataset against the scale attached to its last dimension', async () => {
  await renderApp('/dimension_scales/twoD');

  const abscissa = getAxis('abscissa');
  expect(abscissa.getByText('column (nm)')).toBeVisible();
  expect(abscissa.getByText('−20', { exact: true })).toBeVisible(); // an `X` value

  // The first dimension has neither scale nor label, so it stays unnamed
  expect(getDimMappingBtn('y', 0)).not.toHaveAttribute('title');
});

test('plot complex dataset against its attached dimension scale', async () => {
  await renderApp('/dimension_scales/oneD_complex');

  // Scales reach every core visualization with axes, not just line and heatmap
  const abscissa = getAxis('abscissa');
  expect(abscissa.getByText('time (ms)')).toBeVisible();
  expect(abscissa.getByText('100', { exact: true })).toBeVisible(); // last `T` value
});
