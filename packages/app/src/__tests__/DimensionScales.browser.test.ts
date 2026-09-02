import { expect, test } from 'vitest';

import { getAxis, getDimMappingBtn, renderApp } from '../test-utils';

test('plot 1D dataset against its attached dimension scale', async () => {
  await renderApp('/dimension_scales/oneD');

  const abscissa = getAxis('abscissa');

  // Abscissa label combines the dimension label and the scale's `units` attribute
  expect(abscissa.getByText('position (nm)')).toBeVisible();

  // Abscissa spans the scale's values (-20 to 20) rather than the indices (0 to 40)
  expect(abscissa.getByText('−20', { exact: true })).toBeVisible();
  expect(abscissa.getByText('20', { exact: true })).toBeVisible();
});

test('fall back to the scale name when the dimension has no label', async () => {
  await renderApp('/dimension_scales/oneD_unlabelled');

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

test('use the first scale when a dimension has several attached', async () => {
  await renderApp('/dimension_scales/oneD_multi_scale');

  // `X` is attached before `Y`, so `X` and its units are used
  expect(getAxis('abscissa').getByText('position (nm)')).toBeVisible();
});

test('skip an unusable scale for a usable one on the same dimension', async () => {
  await renderApp('/dimension_scales/oneD_multi_scale_fallback');

  /* `Y` is attached first but is the wrong length, so `X` is used. Falling back
   * to indices here would discard a scale the file does provide. */
  const abscissa = getAxis('abscissa');
  expect(abscissa.getByText('−20', { exact: true })).toBeVisible(); // an `X` value
  expect(abscissa.getByText('40', { exact: true })).not.toBeInTheDocument(); // last index
});

test('ignore a scale whose length does not match its dimension', async () => {
  await renderApp('/dimension_scales/oneD_mismatched');

  /* `Y` has 20 values for a 41-long dimension, so it must be rejected in favour
   * of the index axis - plotting against it would misalign every point. */
  const abscissa = getAxis('abscissa');
  expect(abscissa.getByText('40', { exact: true })).toBeVisible(); // last index
  expect(abscissa.getByText('95', { exact: true })).not.toBeInTheDocument(); // a `Y` value

  // The dimension is still named, since the label is independent of the scale
  expect(getDimMappingBtn('x', 0)).toHaveAttribute('title', 'position');
});

test('plot 2D dataset against the scales attached to both dimensions', async () => {
  await renderApp('/dimension_scales/twoD');

  expect(getAxis('abscissa').getByText('column (nm)')).toBeVisible(); // last dimension
  expect(getAxis('ordinate').getByText('row')).toBeVisible(); // first dimension
});

test('fall back to the index axis for dimensions without a scale', async () => {
  await renderApp('/dimension_scales/twoD_partial');

  expect(getAxis('abscissa').getByText('X (nm)')).toBeVisible(); // scale attached
  expect(getDimMappingBtn('y', 0)).not.toHaveAttribute('title'); // no scale, no label
});
