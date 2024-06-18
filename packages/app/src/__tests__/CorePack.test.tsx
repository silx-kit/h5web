import { screen, within } from '@testing-library/react';
import { expect, test } from 'vitest';

import { getSelectedVisTab, getVisTabs, renderApp } from '../test-utils';
import { Vis } from '../vis-packs/core/visualizations';

test('visualize raw dataset', async () => {
  const { selectExplorerNode } = await renderApp('/entities/raw');

  expect(getVisTabs()).toEqual([Vis.Raw]);
  expect(getSelectedVisTab()).toBe(Vis.Raw);
  expect(screen.getByText(/"int": 42/)).toBeVisible();

  await selectExplorerNode('raw_large');
  expect(screen.getByText(/Too big to display/)).toBeVisible();
});

test('visualize raw image dataset', async () => {
  await renderApp('/entities/raw_png');

  expect(getVisTabs()).toEqual([Vis.Raw]);
  expect(getSelectedVisTab()).toBe(Vis.Raw);
  expect(screen.getByAltText('raw_png')).toBeVisible();
});

test('visualize scalar dataset', async () => {
  // Integer scalar
  const { selectExplorerNode } = await renderApp('/entities/scalar_num');

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

test('visualize 2D boolean dataset', async () => {
  await renderApp('/nD_datasets/twoD_bool');

  expect(getVisTabs()).toEqual([Vis.Matrix, Vis.Line, Vis.Heatmap]);
  expect(getSelectedVisTab()).toBe(Vis.Heatmap);

  const figure = screen.getByRole('figure', { name: 'twoD_bool' });
  expect(figure).toBeVisible();
  expect(within(figure).getByText('1e+0')).toBeVisible(); // color bar limit
});

test('visualize 2D complex dataset', async () => {
  const { user } = await renderApp('/nD_datasets/twoD_cplx');

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
