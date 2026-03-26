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

test('visualize 1D dataset', async () => {
  await renderApp('/arrays/oneD');

  expect(getVisTabs()).toEqual([Vis.Matrix, Vis.Line]);
  expect(getSelectedVisTab()).toBe(Vis.Line);
  expect(page.getByRole('figure', { name: 'oneD' })).toBeVisible();

  if (import.meta.env.VITE_TEST_WITH_SCREENSHOTS) {
    await expect(getMainArea()).toMatchScreenshot();
  }
});

test('visualize 1D dataset as matrix', async () => {
  const { selectVisTab } = await renderApp('/arrays/oneD');
  await selectVisTab(Vis.Matrix);

  expect(getSelectedVisTab()).toBe(Vis.Matrix);
  expect(page.getByText('4.000e+2').first()).toBeVisible();
  expect(page.getByText('3.610e+2').first()).toBeVisible();
});

test('visualize 1D boolean dataset', async () => {
  await renderApp('/arrays/oneD_boolean');

  expect(getVisTabs()).toEqual([Vis.Matrix, Vis.Line]);
  expect(getSelectedVisTab()).toBe(Vis.Line);
  expect(page.getByRole('figure', { name: 'oneD_boolean' })).toBeVisible();
});

test('visualize 1D enum dataset', async () => {
  await renderApp('/arrays/oneD_enum');

  expect(getVisTabs()).toEqual([Vis.Matrix, Vis.Line]);
  expect(getSelectedVisTab()).toBe(Vis.Line);
  expect(page.getByRole('figure', { name: 'oneD_enum' })).toBeVisible();
});

test('visualize 1D complex dataset', async () => {
  await renderApp('/arrays/oneD_complex');

  expect(getVisTabs()).toEqual([Vis.Matrix, Vis.Line]);
  expect(getSelectedVisTab()).toBe(Vis.Line);
  expect(page.getByRole('figure', { name: 'oneD_complex' })).toBeVisible();
});

test('visualize 1D compound dataset', async () => {
  await renderApp('/arrays/oneD_compound');

  expect(getVisTabs()).toEqual([Vis.Compound]);
  expect(getSelectedVisTab()).toBe(Vis.Compound);
  expect(page.getByText('Argon')).toBeVisible();
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

test('visualize 2D dataset', async () => {
  await renderApp('/arrays/twoD');

  expect(getVisTabs()).toEqual([Vis.Matrix, Vis.Line, Vis.Heatmap]);
  expect(getSelectedVisTab()).toBe(Vis.Heatmap);

  const figure = page.getByRole('figure', { name: 'twoD' });
  expect(figure).toBeVisible();
  expect(figure.getByLabelText('Max: 4e+2')).toBeVisible();
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

test('visualize 2D boolean dataset', async () => {
  await renderApp('/arrays/twoD_boolean');

  expect(getVisTabs()).toEqual([Vis.Matrix, Vis.Line, Vis.Heatmap]);
  expect(getSelectedVisTab()).toBe(Vis.Heatmap);

  const figure = page.getByRole('figure', { name: 'twoD_boolean' });
  expect(figure).toBeVisible();
  expect(figure.getByLabelText('Max: 1e+0')).toBeVisible();
});

test('visualize 2D enum dataset', async () => {
  await renderApp('/arrays/twoD_enum');

  expect(getVisTabs()).toEqual([Vis.Matrix, Vis.Line, Vis.Heatmap]);
  expect(getSelectedVisTab()).toBe(Vis.Heatmap);

  const figure = page.getByRole('figure', { name: 'twoD_enum' });
  expect(figure).toBeVisible();
  expect(figure.getByLabelText('Max: 2e+0')).toBeVisible();
});

test('visualize 2D complex dataset', async () => {
  await renderApp('/arrays/twoD_complex');

  expect(getVisTabs()).toEqual([Vis.Matrix, Vis.Line, Vis.Heatmap]);
  expect(getSelectedVisTab()).toBe(Vis.Heatmap);

  const figure = page.getByRole('figure', { name: 'twoD_complex (amplitude)' });
  expect(figure).toBeVisible();
  expect(figure.getByLabelText('Max: 5e+0')).toBeVisible();

  const selector = page.getByRole('combobox', { name: '𝓐 Amplitude' });
  await selector.click();
  const phaseItem = page.getByRole('option', { name: 'φ Phase' });
  await phaseItem.click();

  expect(
    page.getByRole('figure', { name: 'twoD_complex (phase)' }),
  ).toBeVisible();
});

test('visualize 2D opaque dataset', async () => {
  await renderApp('/arrays/twoD_opaque');

  expect(getVisTabs()).toEqual([Vis.Scalar]);
  expect(getSelectedVisTab()).toBe(Vis.Scalar);
  expect(page.getByText('Uint8Array [ 0,1 ]')).toBeVisible();
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
