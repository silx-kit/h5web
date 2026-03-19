import { expect, test, vi } from 'vitest';
import { page } from 'vitest/browser';

import {
  getSelectedVisTab,
  getVisTabs,
  mockConsoleMethod,
  mockDelay,
  renderApp,
} from '../test-utils';
import { NxDataVis } from '../vis-packs/nexus/visualizations';

vi.mock(import('../providers/mock/utils'), { spy: true });

test('visualize NXdata group with explicit signal interpretation', async () => {
  // Signal with "spectrum" interpretation
  const { selectNexusExplorerNode } = await renderApp('/nexus_entry/spectrum');
  expect(getVisTabs()).toEqual([NxDataVis.NxLine, NxDataVis.NxHeatmap]);
  expect(getSelectedVisTab()).toBe(NxDataVis.NxLine);
  expect(
    page.getByRole('figure', { name: 'twoD (arb. units)' }), // signal name + `units` attribute
  ).toBeVisible();

  // Signal with "image" interpretation
  await selectNexusExplorerNode('image');
  expect(getVisTabs()).toEqual([NxDataVis.NxLine, NxDataVis.NxHeatmap]);
  expect(getSelectedVisTab()).toBe(NxDataVis.NxHeatmap);
  expect(
    page.getByRole('figure', { name: 'Interference fringes' }), // `long_name` attribute
  ).toBeVisible();

  // 2D complex signal with "spectrum" interpretation
  await selectNexusExplorerNode('complex_spectrum');
  expect(getVisTabs()).toEqual([NxDataVis.NxLine, NxDataVis.NxHeatmap]);
  expect(getSelectedVisTab()).toBe(NxDataVis.NxLine);
  expect(
    page.getByRole('figure', { name: 'twoD_cplx' }), // signal name (complex vis type is displayed as ordinate label)
  ).toBeVisible();

  // Signal with "rgb-image" interpretation
  await selectNexusExplorerNode('rgb-image');
  expect(getVisTabs()).toEqual([
    NxDataVis.NxLine,
    NxDataVis.NxHeatmap,
    NxDataVis.NxRGB,
  ]);
  expect(getSelectedVisTab()).toBe(NxDataVis.NxRGB);
  expect(
    page.getByRole('figure', { name: 'RGB' }), // `long_name` attribute
  ).toBeVisible();

  // Signal with "rgba-image" interpretation
  await selectNexusExplorerNode('rgba-image');
  expect(getVisTabs()).toEqual([
    NxDataVis.NxLine,
    NxDataVis.NxHeatmap,
    NxDataVis.NxRGB,
  ]);
  expect(getSelectedVisTab()).toBe(NxDataVis.NxRGB);
  expect(
    page.getByRole('figure', { name: 'RGBA' }), // `long_name` attribute
  ).toBeVisible();
});

test('visualize NXdata group without explicit signal interpretation', async () => {
  // 2D signal (no interpretation)
  const { selectNexusExplorerNode } = await renderApp(
    '/nexus_entry/nx_process/nx_data',
  );
  expect(getVisTabs()).toEqual([NxDataVis.NxLine, NxDataVis.NxHeatmap]);
  expect(getSelectedVisTab()).toBe(NxDataVis.NxHeatmap);
  expect(page.getByRole('figure', { name: 'NeXus 2D' })).toBeVisible(); // `title` dataset

  // 1D signal (no interpretation)
  await selectNexusExplorerNode('log_spectrum');
  expect(getVisTabs()).toEqual([NxDataVis.NxLine]);
  expect(page.getByRole('figure', { name: 'oneD' })).toBeVisible(); // signal name

  // 2D complex signal (no interpretation)
  await selectNexusExplorerNode('complex_image');
  expect(getVisTabs()).toEqual([NxDataVis.NxLine, NxDataVis.NxHeatmap]);
  expect(getSelectedVisTab()).toBe(NxDataVis.NxHeatmap);
  expect(
    page.getByRole('figure', { name: 'twoD_cplx (amplitude)' }), // signal name + complex visualization type
  ).toBeVisible();

  // 2D signal and two 1D axes of same length (implicit scatter interpretation)
  await selectNexusExplorerNode('scatter');
  expect(getVisTabs()).toEqual([NxDataVis.NxLine, NxDataVis.NxScatter]);
  expect(getSelectedVisTab()).toBe(NxDataVis.NxScatter);
  expect(page.getByRole('figure', { name: 'scatter_data' })).toBeVisible(); // signal name
});

test('visualize NXdata group with old-style signal', async () => {
  await renderApp('/nexus_entry/old-style');
  expect(getVisTabs()).toEqual([NxDataVis.NxLine, NxDataVis.NxHeatmap]);
  expect(
    page.getByRole('figure', { name: 'twoD' }), // name of dataset with `signal` attribute
  ).toBeVisible();
});

test('visualize NXdata group with boolean signal', async () => {
  await renderApp('/nexus_entry/numeric-like/bool');
  expect(getVisTabs()).toEqual([NxDataVis.NxLine, NxDataVis.NxHeatmap]);
  expect(
    page.getByRole('figure', { name: 'twoD_bool' }), // name of dataset with `signal` attribute
  ).toBeVisible();
});

test('visualize NXdata group with enum signal', async () => {
  await renderApp('/nexus_entry/numeric-like/enum');
  expect(getVisTabs()).toEqual([NxDataVis.NxLine, NxDataVis.NxHeatmap]);
  expect(
    page.getByRole('figure', { name: 'twoD_enum' }), // name of dataset with `signal` attribute
  ).toBeVisible();
});

test('visualize group with `default` attribute', async () => {
  // NXroot with relative path to NXentry group with relative path to NXdata group with 2D signal
  const { selectNexusExplorerNode } = await renderApp();
  expect(getVisTabs()).toEqual([NxDataVis.NxLine, NxDataVis.NxHeatmap]);
  expect(
    page.getByRole('figure', { name: 'NeXus 2D' }), // `title` dataset
  ).toBeVisible();

  // NXentry with relative path to NXdata group with 2D signal
  await selectNexusExplorerNode('nexus_entry');
  expect(getVisTabs()).toEqual([NxDataVis.NxLine, NxDataVis.NxHeatmap]);
  expect(
    page.getByRole('figure', { name: 'NeXus 2D' }), // `title` dataset
  ).toBeVisible();

  // NXentry with absolute path to NXdata group with 2D signal
  await selectNexusExplorerNode('nx_process');
  await selectNexusExplorerNode('absolute_default_path');
  expect(getVisTabs()).toEqual([NxDataVis.NxLine, NxDataVis.NxHeatmap]);
  expect(
    page.getByRole('figure', { name: 'NeXus 2D' }), // `title` dataset
  ).toBeVisible();
});

test('visualize NXentry group with implicit default child NXdata group', async () => {
  await renderApp('/nexus_no_default');
  expect(getVisTabs()).toEqual([NxDataVis.NxLine]);
  expect(
    page.getByRole('figure', { name: 'oneD' }), // signal name of NXdata group "spectrum"
  ).toBeVisible();
});

test('follow default slice on NXdata group', async () => {
  const { selectVisTab } = await renderApp('/nexus_entry/default_slice');

  expect(getSelectedVisTab()).toBe(NxDataVis.NxHeatmap);
  expect(page.getByRole('slider', { name: 'D0' })).toHaveValue(1);
  expect(page.getByRole('slider', { name: 'D2' })).toHaveValue(2);

  // Ignore `default_slice` meant for heatmap
  await selectVisTab(NxDataVis.NxLine);
  expect(page.getByRole('slider', { name: 'D0' })).toHaveValue(0);
  expect(page.getByRole('slider', { name: 'D1' })).toHaveValue(0);
  expect(page.getByRole('slider', { name: 'D2' })).toHaveValue(0);
});

test('follow SILX styles on NXdata group', async () => {
  await renderApp('/nexus_entry/log_spectrum');

  expect(page.getByRole('combobox', { name: 'X Log' })).toBeVisible();
  expect(page.getByRole('combobox', { name: 'Y Log' })).toBeVisible();
});

test('handle unknown/incompatible interpretation gracefully', async () => {
  const { selectNexusExplorerNode } = await renderApp('/nexus_malformed');

  // Signal with unknown interpretation
  await selectNexusExplorerNode('interpretation_unknown');
  expect(getVisTabs()).toEqual([NxDataVis.NxLine, NxDataVis.NxHeatmap]); // fallback based on number of dimensions
  expect(page.getByRole('figure', { name: 'fourD' })).toBeVisible(); // signal name

  // Signal with too few dimensions for "rgb-image" interpretation
  await selectNexusExplorerNode('rgb-image_incompatible');
  expect(getVisTabs()).toEqual([NxDataVis.NxLine]); // fallback based on number of dimensions
  expect(page.getByRole('figure', { name: 'oneD' })).toBeVisible(); // signal name
});

test('show error/fallback for malformed NeXus entity', async () => {
  const errorSpy = mockConsoleMethod('error');
  const { selectExplorerNode } = await renderApp('/nexus_malformed');

  // `default` attribute points to non-existant entity
  await selectExplorerNode('default_not_found');
  expect(page.getByText('No entity found at /test')).toBeVisible();
  errorSpy.mockClear();

  // No `signal` attribute
  await selectExplorerNode('no_signal');
  expect(page.getByText('Nothing to display')).toBeInTheDocument();
  expect(errorSpy).not.toHaveBeenCalled();
  errorSpy.mockClear();

  // `signal` attribute points to non-existant dataset
  await selectExplorerNode('signal_not_found');
  expect(
    page.getByText('Expected "unknown" signal entity to exist'),
  ).toBeVisible();
  errorSpy.mockClear();

  // Signal entity is not a dataset
  await selectExplorerNode('signal_not_dataset');
  expect(
    page.getByText('Expected "some_group" signal to be a dataset'),
  ).toBeVisible();
  errorSpy.mockClear();

  // Old-style signal entity is not a dataset
  await selectExplorerNode('signal_old-style_not_dataset');
  expect(
    page.getByText('Expected old-style "some_group" signal to be a dataset'),
  ).toBeVisible();
  errorSpy.mockClear();

  // Shape of signal dataset is not array
  await selectExplorerNode('signal_not_array');
  expect(page.getByText('Expected array shape')).toBeVisible();
  errorSpy.mockClear();

  // Type of signal dataset is not numeric
  await selectExplorerNode('signal_not_numeric');
  expect(
    page.getByText('Expected numeric, boolean, enum or complex type'),
  ).toBeVisible();
  errorSpy.mockClear();

  errorSpy.mockRestore();
});

test('ignore malformed `default_slice` attribute', async () => {
  const warningSpy = mockConsoleMethod('warn');

  // Different length than signal dimensions
  const { selectNexusExplorerNode } = await renderApp(
    '/nexus_malformed/default_slice_wrong_length',
  );

  // Check that `default_slice` is not applied
  expect(getSelectedVisTab()).toBe(NxDataVis.NxHeatmap);
  expect(page.getByRole('figure', { name: 'fourD' })).toBeVisible();
  expect(page.getByRole('slider', { name: 'D0' })).toHaveValue(0);
  expect(page.getByRole('slider', { name: 'D1' })).toHaveValue(0);
  expect(warningSpy).toHaveBeenCalledWith(
    "Malformed 'default_slice' attribute: expected same length as signal dimensions",
  );

  // Slicing index out of bound
  await selectNexusExplorerNode('default_slice_out_of_bounds');
  expect(page.getByRole('slider', { name: 'D0' })).toHaveValue(0);
  expect(page.getByRole('slider', { name: 'D1' })).toHaveValue(0);
  expect(warningSpy).toHaveBeenCalledWith(
    "Malformed 'default_slice' attribute: expected indices within bounds of signal dimensions",
  );

  warningSpy.mockRestore();
});

test('ignore malformed `SILX_style` attribute', async () => {
  const warningSpy = mockConsoleMethod('warn');

  // Unknown keys, invalid values
  const { selectNexusExplorerNode } = await renderApp(
    '/nexus_malformed/silx_style_unknown',
  );

  // Scales remain unchanged
  expect(getVisTabs()).toEqual([NxDataVis.NxLine]);
  expect(page.getByRole('combobox', { name: 'X Linear' })).toBeVisible();
  expect(page.getByRole('combobox', { name: 'Y Linear' })).toBeVisible();

  // Invalid JSON
  await selectNexusExplorerNode('silx_style_malformed');

  expect(getVisTabs()).toEqual([NxDataVis.NxLine]);
  expect(warningSpy).toHaveBeenCalledWith(
    "Malformed 'SILX_style' attribute: {",
  );

  warningSpy.mockRestore();
});

test('cancel and retry slow fetch of NxLine', async () => {
  const runAll = mockDelay();
  await renderApp({
    initialPath: '/resilience/slow_nx_spectrum',
    waitForLoaders: false,
  });

  await expect.element(page.getByText('Loading data...')).toBeVisible();

  // Cancel all fetches at once
  const errorSpy = mockConsoleMethod('error');
  await page.getByRole('button', { name: 'Cancel?' }).click();
  await expect.element(page.getByText('Request cancelled')).toBeVisible();
  errorSpy.mockRestore();

  // Retry all fetches at once
  await page.getByRole('button', { name: 'Retry?' }).click();
  await expect.element(page.getByText('Loading data...')).toBeVisible();

  // Let fetches succeed
  runAll();
  await expect.element(page.getByRole('figure')).toBeVisible();
});

test('cancel and retry slow fetch of NxHeatmap', async () => {
  const runAll = mockDelay();
  await renderApp({
    initialPath: '/resilience/slow_nx_image',
    waitForLoaders: false,
  });

  await expect.element(page.getByText('Loading data...')).toBeVisible();

  // Cancel all fetches at once
  const errorSpy = mockConsoleMethod('error');
  await page.getByRole('button', { name: 'Cancel?' }).click();
  await expect.element(page.getByText('Request cancelled')).toBeVisible();
  errorSpy.mockRestore();

  // Retry all fetches at once
  await page.getByRole('button', { name: 'Retry?' }).click();
  await expect.element(page.getByText('Loading data...')).toBeVisible();

  // Let fetches succeed
  runAll();
  await expect.element(page.getByRole('figure')).toBeVisible();
});

test('retry fetching automatically when re-selecting NxLine', async () => {
  const runAll = mockDelay();
  const { selectExplorerNode, selectNexusExplorerNode } = await renderApp({
    initialPath: '/resilience/slow_nx_spectrum',
    waitForLoaders: false,
  });

  await expect.element(page.getByText('Loading data...')).toBeVisible();

  // Cancel all fetches at once
  const errorSpy = mockConsoleMethod('error');
  await page.getByRole('button', { name: 'Cancel?' }).click();
  await expect.element(page.getByText('Request cancelled')).toBeVisible();
  errorSpy.mockRestore();

  // Switch to other entity with no visualization
  await selectExplorerNode('entities');
  await expect.element(page.getByText('Nothing to display')).toBeVisible();

  // Select NXdata group again
  await selectNexusExplorerNode('slow_nx_spectrum');
  await expect.element(page.getByText('Loading data...')).toBeVisible();

  // Let fetches succeed
  runAll();
  await expect.element(page.getByRole('figure')).toBeVisible();
});

test('retry fetching automatically when selecting other NxHeatmap slice', async () => {
  const runAll = mockDelay();
  const { user } = await renderApp({
    initialPath: '/resilience/slow_nx_image',
    waitForLoaders: false,
  });

  await expect.element(page.getByText('Loading data...')).toBeVisible();

  // Cancel all fetches at once
  const errorSpy = mockConsoleMethod('error');
  await page.getByRole('button', { name: 'Cancel?' }).click();
  await expect.element(page.getByText('Request cancelled')).toBeVisible();
  errorSpy.mockRestore();

  // Move to other slice to retry fetching automatically
  const d0Slider = page.getByRole('slider', { name: 'D0' });
  await user.type(d0Slider, '{PageUp}');
  await expect.element(page.getByText('Loading data...')).toBeVisible();

  // Let fetches succeed
  runAll();
  await expect.element(page.getByRole('figure')).toBeVisible();

  // Move back to first slice to retry fetching it automatically
  await user.type(d0Slider, '{PageDown}');
  await expect.element(page.getByText('Loading data...')).toBeVisible();

  // Let fetch of first slice succeed
  runAll();
  await expect.element(page.getByRole('figure')).toBeVisible();
});

test('visualize NXnote group', async () => {
  await renderApp('/nexus_note');
  expect(page.getByText('"energy": 10.2')).toBeVisible();
});
