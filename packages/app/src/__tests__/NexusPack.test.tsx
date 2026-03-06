import { expect, test } from 'vitest';
import { page } from 'vitest/browser';

// import { SLOW_TIMEOUT } from '../providers/mock/utils';
import {
  getSelectedVisTab,
  getVisTabs,
  mockConsoleMethod,
  renderApp,
} from '../test-utils';
import { NxDataVis } from '../vis-packs/nexus/visualizations';

test('visualize NXdata group with explicit signal interpretation', async () => {
  // Signal with "spectrum" interpretation
  const { selectExplorerNode } = await renderApp('/nexus_entry/spectrum');
  expect(getVisTabs()).toEqual([NxDataVis.NxLine, NxDataVis.NxHeatmap]);
  expect(getSelectedVisTab()).toBe(NxDataVis.NxLine);
  expect(
    page.getByRole('figure', { name: 'twoD (arb. units)' }), // signal name + `units` attribute
  ).toBeVisible();

  // Signal with "image" interpretation
  await selectExplorerNode('image', true);
  expect(getVisTabs()).toEqual([NxDataVis.NxLine, NxDataVis.NxHeatmap]);
  expect(getSelectedVisTab()).toBe(NxDataVis.NxHeatmap);
  expect(
    page.getByRole('figure', { name: 'Interference fringes' }), // `long_name` attribute
  ).toBeVisible();

  // 2D complex signal with "spectrum" interpretation
  await selectExplorerNode('complex_spectrum', true);
  expect(getVisTabs()).toEqual([NxDataVis.NxLine, NxDataVis.NxHeatmap]);
  expect(getSelectedVisTab()).toBe(NxDataVis.NxLine);
  expect(
    page.getByRole('figure', { name: 'twoD_cplx' }), // signal name (complex vis type is displayed as ordinate label)
  ).toBeVisible();

  // Signal with "rgb-image" interpretation
  await selectExplorerNode('rgb-image', true);
  expect(getVisTabs()).toEqual([
    NxDataVis.NxLine,
    NxDataVis.NxHeatmap,
    NxDataVis.NxRGB,
  ]);
  expect(getSelectedVisTab()).toBe(NxDataVis.NxRGB);
  expect(
    page.getByRole('figure', { name: 'RGB CMY DGW' }), // `long_name` attribute
  ).toBeVisible();
});

test('visualize NXdata group without explicit signal interpretation', async () => {
  // 2D signal (no interpretation)
  const { selectExplorerNode } = await renderApp(
    '/nexus_entry/nx_process/nx_data',
  );
  expect(getVisTabs()).toEqual([NxDataVis.NxLine, NxDataVis.NxHeatmap]);
  expect(getSelectedVisTab()).toBe(NxDataVis.NxHeatmap);
  expect(page.getByRole('figure', { name: 'NeXus 2D' })).toBeVisible(); // `title` dataset

  // 1D signal (no interpretation)
  await selectExplorerNode('log_spectrum', true);
  expect(getVisTabs()).toEqual([NxDataVis.NxLine]);
  expect(page.getByRole('figure', { name: 'oneD' })).toBeVisible(); // signal name

  // 2D complex signal (no interpretation)
  await selectExplorerNode('complex_image', true);
  expect(getVisTabs()).toEqual([NxDataVis.NxLine, NxDataVis.NxHeatmap]);
  expect(getSelectedVisTab()).toBe(NxDataVis.NxHeatmap);
  expect(
    page.getByRole('figure', { name: 'twoD_cplx (amplitude)' }), // signal name + complex visualization type
  ).toBeVisible();

  // 2D signal and two 1D axes of same length (implicit scatter interpretation)
  await selectExplorerNode('scatter', true);
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
  const { selectExplorerNode } = await renderApp();
  expect(getVisTabs()).toEqual([NxDataVis.NxLine, NxDataVis.NxHeatmap]);
  expect(
    page.getByRole('figure', { name: 'NeXus 2D' }), // `title` dataset
  ).toBeVisible();

  // NXentry with relative path to NXdata group with 2D signal
  await selectExplorerNode('nexus_entry', true);
  expect(getVisTabs()).toEqual([NxDataVis.NxLine, NxDataVis.NxHeatmap]);
  expect(
    page.getByRole('figure', { name: 'NeXus 2D' }), // `title` dataset
  ).toBeVisible();

  // NXentry with absolute path to NXdata group with 2D signal
  await selectExplorerNode('nx_process', true);
  await selectExplorerNode('absolute_default_path', true);
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
  const { selectExplorerNode } = await renderApp('/nexus_malformed');

  // Signal with unknown interpretation
  await selectExplorerNode('interpretation_unknown', true);
  expect(getVisTabs()).toEqual([NxDataVis.NxLine, NxDataVis.NxHeatmap]); // fallback based on number of dimensions
  expect(page.getByRole('figure', { name: 'fourD' })).toBeVisible(); // signal name

  // Signal with too few dimensions for "rgb-image" interpretation
  await selectExplorerNode('rgb-image_incompatible', true);
  expect(getVisTabs()).toEqual([NxDataVis.NxLine]); // fallback based on number of dimensions
  expect(page.getByRole('figure', { name: 'oneD' })).toBeVisible(); // signal name
});

test('show error/fallback for malformed NeXus entity', async () => {
  const errorSpy = mockConsoleMethod('error');
  const { selectExplorerNode } = await renderApp('/nexus_malformed');

  // `default` attribute points to non-existant entity
  await selectExplorerNode('default_not_found', true);
  expect(page.getByText('No entity found at /test')).toBeVisible();
  errorSpy.mockClear();

  // No `signal` attribute
  await selectExplorerNode('no_signal', true);
  expect(page.getByText('Nothing to display')).toBeInTheDocument();
  expect(errorSpy).not.toHaveBeenCalled();
  errorSpy.mockClear();

  // `signal` attribute points to non-existant dataset
  await selectExplorerNode('signal_not_found', true);
  expect(
    page.getByText('Expected "unknown" signal entity to exist'),
  ).toBeVisible();
  errorSpy.mockClear();

  // Signal entity is not a dataset
  await selectExplorerNode('signal_not_dataset', true);
  expect(
    page.getByText('Expected "some_group" signal to be a dataset'),
  ).toBeVisible();
  errorSpy.mockClear();

  // Old-style signal entity is not a dataset
  await selectExplorerNode('signal_old-style_not_dataset', true);
  expect(
    page.getByText('Expected old-style "some_group" signal to be a dataset'),
  ).toBeVisible();
  errorSpy.mockClear();

  // Shape of signal dataset is not array
  await selectExplorerNode('signal_not_array', true);
  expect(page.getByText('Expected array shape')).toBeVisible();
  errorSpy.mockClear();

  // Type of signal dataset is not numeric
  await selectExplorerNode('signal_not_numeric', true);
  expect(
    page.getByText('Expected numeric, boolean, enum or complex type'),
  ).toBeVisible();
  errorSpy.mockClear();

  errorSpy.mockRestore();
});

test('ignore malformed `default_slice` attribute', async () => {
  const warningSpy = mockConsoleMethod('warn');

  // Different length than signal dimensions
  const { selectExplorerNode } = await renderApp(
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
  await selectExplorerNode('default_slice_out_of_bounds', true);
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
  const { selectExplorerNode } = await renderApp(
    '/nexus_malformed/silx_style_unknown',
  );

  // Scales remain unchanged
  expect(getVisTabs()).toEqual([NxDataVis.NxLine]);
  expect(page.getByRole('combobox', { name: 'X Linear' })).toBeVisible();
  expect(page.getByRole('combobox', { name: 'Y Linear' })).toBeVisible();

  // Invalid JSON
  await selectExplorerNode('silx_style_malformed', true);

  expect(getVisTabs()).toEqual([NxDataVis.NxLine]);
  expect(warningSpy).toHaveBeenCalledWith(
    "Malformed 'SILX_style' attribute: {",
  );

  warningSpy.mockRestore();
});

// eslint-disable-next-line vitest/no-commented-out-tests
// test('cancel and retry slow fetch of NxLine', async () => {
//   const { user } = await renderApp({
//     initialPath: '/resilience/slow_nx_spectrum',
//     withFakeTimers: true,
//   });

//   await expect(page.findByText(/Loading data/)).resolves.toBeVisible();

//   // Cancel all fetches at once
//   const errorSpy = mockConsoleMethod('error');
//   await user.click(page.getByRole('button', { name: /Cancel/ }));
//   await expect(page.findByText('Request cancelled')).resolves.toBeVisible();
//   errorSpy.mockRestore();

//   // Retry all fetches at once
//   await user.click(page.getByRole('button', { name: /Retry/ }));
//   await expect(page.findByText(/Loading data/)).resolves.toBeVisible();

//   // Let fetches succeed
//   await expect(
//     page.findByRole('figure', undefined, { timeout: SLOW_TIMEOUT }),
//   ).resolves.toBeVisible();
// });

// eslint-disable-next-line vitest/no-commented-out-tests
// test('cancel and retry slow fetch of NxHeatmap', async () => {
//   const { user } = await renderApp({
//     initialPath: '/resilience/slow_nx_image',
//     withFakeTimers: true,
//   });

//   await expect(page.findByText(/Loading data/)).resolves.toBeVisible();

//   // Cancel all fetches at once
//   const errorSpy = mockConsoleMethod('error');
//   await user.click(page.getByRole('button', { name: /Cancel/ }));
//   await expect(page.findByText('Request cancelled')).resolves.toBeVisible();
//   errorSpy.mockRestore();

//   // Retry all fetches at once
//   await user.click(page.getByRole('button', { name: /Retry/ }));
//   await expect(page.findByText(/Loading data/)).resolves.toBeVisible();

//   // Let fetches succeed
//   await expect(
//     page.findByRole('figure', undefined, { timeout: SLOW_TIMEOUT }),
//   ).resolves.toBeVisible();
// });

// eslint-disable-next-line vitest/no-commented-out-tests
// test('retry fetching automatically when re-selecting NxLine', async () => {
//   const { user, selectExplorerNode } = await renderApp({
//     initialPath: '/resilience/slow_nx_spectrum',
//     withFakeTimers: true,
//   });

//   await expect(page.findByText(/Loading data/)).resolves.toBeVisible();

//   // Cancel all fetches at once
//   const errorSpy = mockConsoleMethod('error');
//   await user.click(page.getByRole('button', { name: /Cancel/ }));
//   await expect(page.findByText('Request cancelled')).resolves.toBeVisible();
//   errorSpy.mockRestore();

//   // Switch to other entity with no visualization
//   await selectExplorerNode('entities');
//   await expect(page.findByText(/Nothing to display/)).resolves.toBeVisible();

//   // Select NXdata group again
//   await selectExplorerNode('slow_nx_spectrum');
//   await expect(page.findByText(/Loading data/)).resolves.toBeVisible();

//   // Let fetches succeed
//   await expect(
//     page.findByRole('figure', undefined, { timeout: SLOW_TIMEOUT }),
//   ).resolves.toBeVisible();
// });

// eslint-disable-next-line vitest/no-commented-out-tests
// test('retry fetching automatically when selecting other NxHeatmap slice', async () => {
//   const { user } = await renderApp({
//     initialPath: '/resilience/slow_nx_image',
//     withFakeTimers: true,
//   });

//   await expect(page.findByText(/Loading data/)).resolves.toBeVisible();

//   // Cancel all fetches at once
//   const errorSpy = mockConsoleMethod('error');
//   await user.click(page.getByRole('button', { name: /Cancel/ }));
//   await expect(page.findByText('Request cancelled')).resolves.toBeVisible();
//   errorSpy.mockRestore();

//   // Move to other slice to retry fetching automatically
//   const d0Slider = page.getByRole('slider', { name: 'D0' });
//   await user.type(d0Slider, '{PageUp}');
//   await expect(page.findByText(/Loading data/)).resolves.toBeVisible();

//   // Let fetches succeed
//   await expect(
//     page.findByRole('figure', undefined, { timeout: SLOW_TIMEOUT }),
//   ).resolves.toBeVisible();

//   // Move back to first slice to retry fetching it automatically
//   await user.type(d0Slider, '{PageDown}');
//   await expect(page.findByText(/Loading data/)).resolves.toBeVisible();

//   // Let fetch of first slice succeed
//   await expect(
//     page.findByRole('figure', undefined, { timeout: SLOW_TIMEOUT }),
//   ).resolves.toBeVisible();
// });
