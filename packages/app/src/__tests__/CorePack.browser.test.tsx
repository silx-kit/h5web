import { expect, test } from 'vitest';
import { page } from 'vitest/browser';

import {
  getMainArea,
  getSelectedVisTab,
  getVisTabs,
  renderApp,
} from '../test-utils';
import { Vis } from '../vis-packs/core/visualizations';

test('visualize unknown dataset', async () => {
  const { selectExplorerNode } = await renderApp('/scalars/unknown');

  expect(getVisTabs()).toEqual([Vis.Scalar]);
  expect(getSelectedVisTab()).toBe(Vis.Scalar);
  expect(page.getByText('"int": 42')).toBeVisible();

  await selectExplorerNode('unknown_large');
  expect(page.getByText('Too big to display')).toBeVisible();
});

test('visualize opaque binary image dataset', async () => {
  await renderApp('/scalars/opaque_png');

  expect(getVisTabs()).toEqual([Vis.Scalar]);
  expect(getSelectedVisTab()).toBe(Vis.Scalar);
  expect(page.getByAltText('opaque_png')).toBeVisible();
});

test('visualize scalar dataset', async () => {
  // Integer scalar
  const { selectExplorerNode } = await renderApp('/scalars/number');

  expect(getVisTabs()).toEqual([Vis.Scalar]);
  expect(getSelectedVisTab()).toBe(Vis.Scalar);
  expect(page.getByText('0')).toBeVisible();

  // String scalar
  await selectExplorerNode('string');

  expect(getVisTabs()).toEqual([Vis.Scalar]);
  expect(getSelectedVisTab()).toBe(Vis.Scalar);
  expect(page.getByText('foo')).toBeVisible();
});

test('visualize scalar compound dataset', async () => {
  await renderApp('/scalars/compound');

  expect(getVisTabs()).toEqual([Vis.Compound]);
  expect(getSelectedVisTab()).toBe(Vis.Compound);
  expect(page.getByText('foo')).toBeVisible();
});

test('visualize 1D dataset as line', async () => {
  await renderApp('/arrays/oneD');

  expect(getVisTabs()).toEqual([Vis.Matrix, Vis.Line]);
  expect(getSelectedVisTab()).toBe(Vis.Line);
  expect(page.getByRole('figure', { name: 'oneD' })).toBeVisible();

  if (import.meta.env.VITE_TEST_WITH_SCREENSHOTS) {
    await expect(getMainArea()).toMatchScreenshot();
  }
});

test('visualize 1D dataset as line with constant interpolation', async () => {
  await renderApp('/arrays/oneD');

  await page.getByRole('button', { name: 'Aspect' }).click();
  await page.getByLabelText('Constant').click();

  if (import.meta.env.VITE_TEST_WITH_SCREENSHOTS) {
    await expect(getMainArea()).toMatchScreenshot();
  }
});

test('visualize 1D dataset as points', async () => {
  await renderApp('/arrays/oneD');

  await page.getByRole('button', { name: 'Aspect' }).click();
  await page.getByLabelText('Points').click();

  if (import.meta.env.VITE_TEST_WITH_SCREENSHOTS) {
    await expect(getMainArea()).toMatchScreenshot();
  }
});

test('visualize 1D dataset as matrix', async () => {
  const { selectVisTab } = await renderApp('/arrays/oneD');
  await selectVisTab(Vis.Matrix);

  expect(getSelectedVisTab()).toBe(Vis.Matrix);

  const grid = page.getByRole('grid');
  expect(grid).toBeVisible();
  expect(grid).toHaveAttribute('aria-colcount', '1');
  expect(grid).toHaveAttribute('aria-rowcount', '41');

  const cell = page.getByRole('gridcell', { name: '4.000e+2' });
  const row = page.getByRole('row').filter({ has: cell });
  expect(cell.first()).toBeVisible();
  expect(cell.first()).toHaveAttribute('aria-colindex', '1');
  expect(row.first()).toHaveAttribute('aria-rowindex', '1');

  if (import.meta.env.VITE_TEST_WITH_SCREENSHOTS) {
    await expect(getMainArea()).toMatchScreenshot();
  }
});

test('visualize 1D boolean dataset as line', async () => {
  await renderApp('/arrays/oneD_boolean');

  expect(getVisTabs()).toEqual([Vis.Matrix, Vis.Line]);
  expect(getSelectedVisTab()).toBe(Vis.Line);
  expect(page.getByRole('figure', { name: 'oneD_boolean' })).toBeVisible();
});

test('visualize 1D enum dataset as line', async () => {
  await renderApp('/arrays/oneD_enum');

  expect(getVisTabs()).toEqual([Vis.Matrix, Vis.Line]);
  expect(getSelectedVisTab()).toBe(Vis.Line);
  expect(page.getByRole('figure', { name: 'oneD_enum' })).toBeVisible();
});

test('visualize 1D complex dataset as line', async () => {
  await renderApp('/arrays/oneD_complex');

  expect(getVisTabs()).toEqual([Vis.Matrix, Vis.Line]);
  expect(getSelectedVisTab()).toBe(Vis.Line);
  expect(page.getByRole('figure', { name: 'oneD_complex' })).toBeVisible();

  if (import.meta.env.VITE_TEST_WITH_SCREENSHOTS) {
    await expect(getMainArea()).toMatchScreenshot();
  }
});

test('visualize 1D complex dataset as line with constant interpolation', async () => {
  await renderApp('/arrays/oneD_complex');

  await page.getByRole('button', { name: 'Aspect' }).click();
  await page.getByLabelText('Constant').click();

  if (import.meta.env.VITE_TEST_WITH_SCREENSHOTS) {
    await expect(getMainArea()).toMatchScreenshot();
  }
});

test('visualize 1D compound dataset', async () => {
  await renderApp('/arrays/oneD_compound');

  expect(getVisTabs()).toEqual([Vis.Compound]);
  expect(getSelectedVisTab()).toBe(Vis.Compound);
  expect(page.getByText('Argon')).toBeVisible();

  const grid = page.getByRole('grid');
  expect(grid).toBeVisible();
  expect(grid).toHaveAttribute('aria-colcount', '5');
  expect(grid).toHaveAttribute('aria-rowcount', '5');

  const colHeader = page.getByRole('columnheader', { name: 'string' });
  expect(colHeader).toHaveAttribute('aria-colindex', '1');
  expect(colHeader).toBeVisible();

  const cell = page.getByRole('gridcell', { name: 'Hydrogen' });
  const row = page.getByRole('row').filter({ has: cell });
  expect(cell).toBeVisible();
  expect(cell).toHaveAttribute('aria-colindex', '1');
  expect(row).toHaveAttribute('aria-rowindex', '1');

  if (import.meta.env.VITE_TEST_WITH_SCREENSHOTS) {
    await expect(getMainArea()).toMatchScreenshot();
  }
});

test('visualize 1D mixed compound dataset', async () => {
  await renderApp('/arrays/oneD_compound_mixed');

  expect(getVisTabs()).toEqual([Vis.Scalar]);
  expect(getSelectedVisTab()).toBe(Vis.Scalar);
  expect(page.getByText('"int": 42')).toBeVisible();
});

test('visualize 1D opaque dataset', async () => {
  await renderApp('/arrays/oneD_opaque');

  expect(getVisTabs()).toEqual([Vis.Scalar]);
  expect(getSelectedVisTab()).toBe(Vis.Scalar);
  expect(page.getByText('"foo"')).toBeVisible();
});

test('visualize 2D dataset as heatmap', async () => {
  await renderApp('/arrays/twoD');

  expect(getVisTabs()).toEqual([Vis.Matrix, Vis.Line, Vis.Heatmap]);
  expect(getSelectedVisTab()).toBe(Vis.Heatmap);

  const figure = page.getByRole('figure', { name: 'twoD' });
  expect(figure).toBeVisible();
  expect(figure.getByLabelText('Max: 4e+2')).toBeVisible();

  if (import.meta.env.VITE_TEST_WITH_SCREENSHOTS) {
    await expect(getMainArea()).toMatchScreenshot();
  }
});

test('visualize 2D dataset as heatmap with inverted color map', async () => {
  await renderApp('/arrays/twoD');
  await page.getByRole('button', { name: 'Invert' }).click();

  if (import.meta.env.VITE_TEST_WITH_SCREENSHOTS) {
    await expect(getMainArea()).toMatchScreenshot();
  }
});

test('visualize 2D dataset as line', async () => {
  const { selectVisTab } = await renderApp('/arrays/twoD');
  await selectVisTab(Vis.Line);

  expect(getSelectedVisTab()).toBe(Vis.Line);
  expect(page.getByRole('figure', { name: 'twoD' })).toBeVisible();
});

test('visualize 2D dataset as matrix', async () => {
  const { selectVisTab } = await renderApp('/arrays/twoD');
  await selectVisTab(Vis.Matrix);

  expect(getSelectedVisTab()).toBe(Vis.Matrix);
  expect(page.getByText('4.000e+2')).toBeVisible();
  expect(page.getByText('3.950e+2')).toBeVisible();
});

test('visualize 2D boolean dataset as heatmap', async () => {
  await renderApp('/arrays/twoD_boolean');

  expect(getVisTabs()).toEqual([Vis.Matrix, Vis.Line, Vis.Heatmap]);
  expect(getSelectedVisTab()).toBe(Vis.Heatmap);

  const figure = page.getByRole('figure', { name: 'twoD_boolean' });
  expect(figure).toBeVisible();
  expect(figure.getByLabelText('Max: 1e+0')).toBeVisible();
});

test('visualize 2D enum dataset as heatmap', async () => {
  await renderApp('/arrays/twoD_enum');

  expect(getVisTabs()).toEqual([Vis.Matrix, Vis.Line, Vis.Heatmap]);
  expect(getSelectedVisTab()).toBe(Vis.Heatmap);

  const figure = page.getByRole('figure', { name: 'twoD_enum' });
  expect(figure).toBeVisible();
  expect(figure.getByLabelText('Max: 2e+0')).toBeVisible();
});

test('visualize 2D complex dataset as heatmap (amplitude)', async () => {
  await renderApp('/arrays/twoD_complex');

  expect(getVisTabs()).toEqual([Vis.Matrix, Vis.Line, Vis.Heatmap]);
  expect(getSelectedVisTab()).toBe(Vis.Heatmap);

  const figure = page.getByRole('figure', { name: 'twoD_complex (amplitude)' });
  expect(figure).toBeVisible();
  expect(figure.getByLabelText('Max: 5e+0')).toBeVisible();

  if (import.meta.env.VITE_TEST_WITH_SCREENSHOTS) {
    await expect(getMainArea()).toMatchScreenshot();
  }
});

test('visualize 2D complex dataset as heatmap (phase)', async () => {
  await renderApp('/arrays/twoD_complex');

  await page.getByRole('combobox', { name: '𝓐 Amplitude' }).click(); // open selector
  await page.getByRole('option', { name: 'φ Phase' }).click(); // select option

  const figure = page.getByRole('figure', { name: 'twoD_complex (phase)' });
  expect(figure).toBeVisible();
  expect(figure.getByLabelText('Max: 3.108e+0')).toBeVisible();

  if (import.meta.env.VITE_TEST_WITH_SCREENSHOTS) {
    await expect(getMainArea()).toMatchScreenshot();
  }
});

test('visualize 2D complex dataset as heatmap (phase & amplitude)', async () => {
  await renderApp('/arrays/twoD_complex');

  await page.getByRole('combobox', { name: '𝓐 Amplitude' }).click(); // open selector
  await page.getByRole('option', { name: 'φ𝓐 Phase & Amp' }).click(); // select option

  const figure = page.getByRole('figure', {
    name: 'twoD_complex (phase & amplitude)',
  });
  expect(figure).toBeVisible();
  expect(figure.getByLabelText('Max: 3.108e+0')).toBeVisible();

  if (import.meta.env.VITE_TEST_WITH_SCREENSHOTS) {
    await expect(getMainArea()).toMatchScreenshot();
  }
});

test('visualize 2D opaque dataset', async () => {
  await renderApp('/arrays/twoD_opaque');

  expect(getVisTabs()).toEqual([Vis.Scalar]);
  expect(getSelectedVisTab()).toBe(Vis.Scalar);
  expect(page.getByText('Uint8Array [ 0,1 ]')).toBeVisible();
});

test('visualize dataset slice with only zeros as heatmap', async () => {
  const { user } = await renderApp('/arrays/fourD');

  // Move to fifth slice with keyboard
  const d1Slider = page.getByRole('slider', { name: 'D1' });
  await user.type(d1Slider, '{ArrowUp}{ArrowUp}{ArrowUp}{ArrowUp}');

  await expect.element(page.getByLabelText('Min: −∞')).toBeVisible();
  expect(page.getByLabelText('+∞')).toBeVisible();
  expect(d1Slider).toHaveValue(4);

  if (import.meta.env.VITE_TEST_WITH_SCREENSHOTS) {
    await expect(getMainArea()).toMatchScreenshot();
  }
});

test('flip heatmap', async () => {
  await renderApp('/arrays/typed/uint8');

  const flipX = page.getByRole('button', { name: 'Flip X' });
  const flipY = page.getByRole('button', { name: 'Flip Y' });

  await flipX.click();
  await flipY.click();

  expect(flipX).toHaveAttribute('aria-pressed', 'true');
  expect(flipY).toHaveAttribute('aria-pressed', 'true');

  if (import.meta.env.VITE_TEST_WITH_SCREENSHOTS) {
    await expect(getMainArea()).toMatchScreenshot();
  }
});

test('show interactions help for heatmap according to "keep ratio"', async () => {
  await renderApp();

  const helpBtn = page.getByRole('button', { name: 'Show help' });
  const keepRatioBtn = page.getByRole('button', { name: 'Keep ratio' });

  // By default, "keep ratio" should be enabled
  expect(keepRatioBtn).toHaveAttribute('aria-pressed', 'true');

  // Since "keep ratio" is enabled, only basic interactions should be available (no axial-zoom interactions)
  await helpBtn.click();

  expect(page.getByText('Pan')).toBeVisible();
  expect(page.getByText('Select to zoom')).toBeVisible();
  expect(page.getByText('Zoom', { exact: true })).toBeVisible();

  expect(page.getByText('Zoom in X')).not.toBeInTheDocument();
  expect(page.getByText('Zoom in Y')).not.toBeInTheDocument();

  // Toggle "keep ratio" and check that axial-zoom interactions are now available
  await keepRatioBtn.click();
  await helpBtn.click();

  expect(page.getByText('Zoom in X', { exact: true })).toBeVisible();
  expect(page.getByText('Zoom in Y', { exact: true })).toBeVisible();
  expect(page.getByText('Select to zoom in X')).toBeVisible();
  expect(page.getByText('Select to zoom in Y')).toBeVisible();
});

test('visualize RGB image dataset', async () => {
  await renderApp('/arrays/threeD_rgb');

  expect(getVisTabs()).toEqual([Vis.Matrix, Vis.Line, Vis.Heatmap, Vis.RGB]);
  expect(getSelectedVisTab()).toBe(Vis.RGB);
  expect(page.getByRole('figure', { name: 'threeD_rgb' })).toBeVisible();

  if (import.meta.env.VITE_TEST_WITH_SCREENSHOTS) {
    await expect(getMainArea()).toMatchScreenshot();
  }
});

test('visualize BGR image dataset', async () => {
  await renderApp('/arrays/threeD_rgb');
  await page.getByRole('radio', { name: 'BGR' }).click();

  if (import.meta.env.VITE_TEST_WITH_SCREENSHOTS) {
    await expect(getMainArea()).toMatchScreenshot();
  }
});

test('visualize RGBA image dataset', async () => {
  await renderApp('/arrays/threeD_rgba');

  expect(getVisTabs()).toEqual([Vis.Matrix, Vis.Line, Vis.Heatmap, Vis.RGB]);
  expect(getSelectedVisTab()).toBe(Vis.RGB);
  expect(page.getByRole('figure', { name: 'threeD_rgba' })).toBeVisible();

  if (import.meta.env.VITE_TEST_WITH_SCREENSHOTS) {
    await expect(getMainArea()).toMatchScreenshot();
  }
});

test('visualize BGRA image dataset', async () => {
  await renderApp('/arrays/threeD_rgba');
  await page.getByRole('radio', { name: 'BGR' }).click();

  if (import.meta.env.VITE_TEST_WITH_SCREENSHOTS) {
    await expect(getMainArea()).toMatchScreenshot();
  }
});
