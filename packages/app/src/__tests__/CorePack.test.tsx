import { screen, within } from '@testing-library/react';
import { expect, test } from 'vitest';

import { getSelectedVisTab, getVisTabs, renderApp } from '../test-utils';
import { Vis } from '../vis-packs/core/visualizations';

test('visualize scalar datasets with printable types', async () => {
  const { selectExplorerNode } = await renderApp('/scalars/float');

  expect(getVisTabs()).toEqual([Vis.Scalar]);
  expect(getSelectedVisTab()).toBe(Vis.Scalar);
  expect(screen.getByText('0.123')).toBeVisible();

  await selectExplorerNode('int');
  expect(screen.getByText('0')).toBeVisible();

  await selectExplorerNode('bigint');
  expect(screen.getByText('9007199254740992')).toBeVisible();

  await selectExplorerNode('string');
  expect(screen.getByText('foo')).toBeVisible();

  await selectExplorerNode('boolean');
  expect(screen.getByText('true')).toBeVisible();

  await selectExplorerNode('enum');
  expect(screen.getByText('BAZ')).toBeVisible();

  await selectExplorerNode('complex');
  expect(screen.getByText('1 + 5 i')).toBeVisible();
});

test('visualize scalar compound dataset', async () => {
  await renderApp('/scalars/compound');

  expect(getVisTabs()).toEqual([Vis.Compound]);
  expect(getSelectedVisTab()).toBe(Vis.Compound);
  expect(screen.getByText('foo')).toBeVisible();
});

test('visualize scalar array and vlen datasets', async () => {
  const { selectExplorerNode } = await renderApp('/scalars/array');

  expect(getVisTabs()).toEqual([Vis.Scalar]);
  expect(getSelectedVisTab()).toBe(Vis.Scalar);
  expect(
    screen.getByText(`[
  1,
  2
]`),
  ).toBeVisible();

  await selectExplorerNode('vlen');
  expect(
    screen.getByText(`[
  1,
  2,
  3
]`),
  ).toBeVisible();
});

test('visualize scalar opaque dataset with typed array', async () => {
  await renderApp('/scalars/opaque');

  expect(getVisTabs()).toEqual([Vis.Scalar]);
  expect(getSelectedVisTab()).toBe(Vis.Scalar);
  expect(screen.getByText('Uint8Array [ 0,1,2 ]')).toBeVisible();
});

test('visualize scalar opaque dataset with PNG image', async () => {
  await renderApp('/scalars/opaque_png');

  expect(getVisTabs()).toEqual([Vis.Scalar]);
  expect(getSelectedVisTab()).toBe(Vis.Scalar);
  expect(screen.getByAltText('opaque_png')).toBeVisible();
});

test('visualize scalar dataset with unknown type', async () => {
  await renderApp('/scalars/unknown');

  expect(getVisTabs()).toEqual([Vis.Scalar]);
  expect(getSelectedVisTab()).toBe(Vis.Scalar);
  expect(
    screen.getByText(`{
  "int": 42
}`),
  ).toBeVisible();
});

test('visualize scalar dataset too big to display when serialized', async () => {
  await renderApp('/scalars/unknown_large');

  expect(getVisTabs()).toEqual([Vis.Scalar]);
  expect(getSelectedVisTab()).toBe(Vis.Scalar);
  expect(screen.getByText('Too big to display')).toBeVisible();
});

test('visualize 1D datasets as matrix', async () => {
  const { user, selectExplorerNode } = await renderApp({
    initialPath: '/arrays/oneD',
    preferredVis: Vis.Matrix,
  });

  expect(getSelectedVisTab()).toBe(Vis.Matrix);
  expect(screen.getByText('4.000e+2')).toBeVisible(); // scientific notation by default
  expect(screen.getByText('3.610e+2')).toBeVisible();

  // Switch to exact notation
  await user.click(await screen.findByRole('button', { name: 'Exact' }));
  expect(screen.getByText('400')).toBeVisible();

  await selectExplorerNode('oneD_bigint');
  expect(getSelectedVisTab()).toBe(Vis.Matrix);
  expect(screen.getByText('9007199254740986')).toBeVisible();

  await selectExplorerNode('oneD_bool');
  expect(getSelectedVisTab()).toBe(Vis.Matrix);
  expect(screen.getByText('true')).toBeVisible();

  await selectExplorerNode('oneD_enum');
  expect(getSelectedVisTab()).toBe(Vis.Matrix);
  expect(screen.getByText('FOO')).toBeVisible();

  await selectExplorerNode('oneD_cplx');
  expect(getSelectedVisTab()).toBe(Vis.Matrix);
  expect(
    screen.getByText('0.951105719935495 + 0.30886552009893214 i'),
  ).toBeVisible();
});

test('visualize 1D datasets as line', async () => {
  const { selectExplorerNode } = await renderApp('/arrays/oneD');

  expect(getVisTabs()).toEqual([Vis.Matrix, Vis.Line]);
  expect(getSelectedVisTab()).toBe(Vis.Line);
  expect(screen.getByRole('figure', { name: 'oneD' })).toBeVisible();

  await selectExplorerNode('oneD_bool');
  expect(getSelectedVisTab()).toBe(Vis.Line);
  expect(screen.getByRole('figure', { name: 'oneD_bool' })).toBeVisible();

  await selectExplorerNode('oneD_enum');
  expect(getSelectedVisTab()).toBe(Vis.Line);
  expect(screen.getByRole('figure', { name: 'oneD_enum' })).toBeVisible();

  await selectExplorerNode('oneD_cplx');
  expect(getSelectedVisTab()).toBe(Vis.Line);
  expect(screen.getByRole('figure', { name: 'oneD_cplx' })).toBeVisible();
});

test('visualize 1D compound dataset', async () => {
  await renderApp('/arrays/oneD_compound');

  expect(getVisTabs()).toEqual([Vis.Compound]);
  expect(getSelectedVisTab()).toBe(Vis.Compound);
  expect(screen.getByText('Argon')).toBeVisible();
});

test('visualize 1D opaque datasets', async () => {
  const { selectExplorerNode } = await renderApp('/arrays/oneD_opaque');

  expect(getVisTabs()).toEqual([Vis.Array]);
  expect(getSelectedVisTab()).toBe(Vis.Array);
  expect(screen.getByText('Uint8Array [ 0,1,2 ]')).toBeVisible();

  await selectExplorerNode('oneD_opaque_png');
  expect(screen.getByAltText('oneD_opaque_png')).toBeVisible();
});

test('visualize 2D dataset as matrix', async () => {
  const { selectExplorerNode } = await renderApp({
    initialPath: '/arrays/twoD',
    preferredVis: Vis.Matrix,
  });

  expect(getSelectedVisTab()).toBe(Vis.Matrix);
  expect(screen.getByText('4.000e+2')).toBeVisible();
  expect(screen.getByText('3.950e+2')).toBeVisible();

  await selectExplorerNode('twoD_bigint');
  expect(screen.getByText('9.007e+15')).toBeVisible();

  await selectExplorerNode('twoD_bool');
  expect(screen.getByText('true')).toBeVisible();
  expect(screen.getByText('false')).toBeVisible();

  await selectExplorerNode('twoD_enum');
  expect(screen.getByText('FOO')).toBeVisible();
  expect(screen.getByText('BAR')).toBeVisible();
  expect(screen.getByText('BAZ')).toBeVisible();

  await selectExplorerNode('twoD_cplx');
  expect(screen.getByText('0.000e+0 − 5.000e+0 i')).toBeVisible();
});

test('visualize 2D dataset as line', async () => {
  const { selectExplorerNode } = await renderApp({
    initialPath: '/arrays/twoD',
    preferredVis: Vis.Line,
  });

  expect(getSelectedVisTab()).toBe(Vis.Line);
  expect(screen.getByRole('figure', { name: 'twoD' })).toBeVisible();

  await selectExplorerNode('twoD_bigint');
  expect(screen.getByRole('figure', { name: 'twoD_bigint' })).toBeVisible();

  await selectExplorerNode('twoD_bool');
  expect(screen.getByRole('figure', { name: 'twoD_bool' })).toBeVisible();

  await selectExplorerNode('twoD_enum');
  expect(screen.getByRole('figure', { name: 'twoD_enum' })).toBeVisible();
});

test('visualize 2D datasets as heatmap', async () => {
  const { selectExplorerNode } = await renderApp('/arrays/twoD');

  expect(getVisTabs()).toEqual([Vis.Matrix, Vis.Line, Vis.Heatmap]);
  expect(getSelectedVisTab()).toBe(Vis.Heatmap);

  const figure = screen.getByRole('figure', { name: 'twoD' });
  expect(figure).toBeVisible();
  expect(within(figure).getByText('4e+2')).toBeVisible(); // color bar limit

  await selectExplorerNode('twoD_bigint');
  expect(within(figure).getByText('9.007e+15')).toBeVisible();

  await selectExplorerNode('twoD_bool');
  expect(within(figure).getByText('1e+0')).toBeVisible();

  await selectExplorerNode('twoD_enum');
  expect(within(figure).getByText('2e+0')).toBeVisible();
});

test('visualize 2D complex dataset as line', async () => {
  const { user } = await renderApp({
    initialPath: '/arrays/twoD_cplx',
    preferredVis: Vis.Line,
  });

  expect(getVisTabs()).toEqual([Vis.Matrix, Vis.Line, Vis.Heatmap]);
  expect(getSelectedVisTab()).toBe(Vis.Heatmap);

  const figure = screen.getByRole('figure', { name: 'twoD_cplx' });
  expect(figure).toBeVisible();
  expect(screen.getByText('Amplitude')).toBeVisible();

  const selector = screen.getByRole('combobox', { name: '𝓐 Amplitude' });
  await user.click(selector);
  const phaseItem = screen.getByRole('option', { name: 'φ Phase' });
  await user.click(phaseItem);

  expect(screen.getByText('Phase')).toBeVisible();
});

test('visualize 2D complex dataset as heatmap', async () => {
  const { user } = await renderApp('/arrays/twoD_cplx');

  expect(getVisTabs()).toEqual([Vis.Matrix, Vis.Line, Vis.Heatmap]);
  expect(getSelectedVisTab()).toBe(Vis.Heatmap);

  const figure = screen.getByRole('figure', { name: 'twoD_cplx (amplitude)' });
  expect(figure).toBeVisible();
  expect(within(figure).getByText('5e+0')).toBeVisible(); // color bar limit

  const selector = screen.getByRole('combobox', { name: '𝓐 Amplitude' });
  await user.click(selector);
  const phaseItem = screen.getByRole('option', { name: 'φ Phase' });
  await user.click(phaseItem);

  expect(
    screen.getByRole('figure', { name: 'twoD_cplx (phase)' }),
  ).toBeVisible();
});

test('visualize 2D opaque dataset', async () => {
  await renderApp('/nD_datasets/twoD_opaque');

  expect(getVisTabs()).toEqual([Vis.Array]);
  expect(getSelectedVisTab()).toBe(Vis.Array);
  expect(screen.getByText('Uint8Array [ 0,1 ]')).toBeVisible();
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
