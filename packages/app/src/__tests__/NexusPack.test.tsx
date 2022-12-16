import { screen } from '@testing-library/react';

import {
  findVisTabs,
  findSelectedVisTab,
  mockConsoleMethod,
  renderApp,
} from '../test-utils';
import { NexusVis } from '../vis-packs/nexus/visualizations';

test('visualize NXdata group with explicit signal interpretation', async () => {
  // Signal with "spectrum" interpretation
  const { selectExplorerNode } = await renderApp('/nexus_entry/spectrum');
  await expect(findVisTabs()).resolves.toEqual([NexusVis.NxSpectrum]);
  await expect(
    screen.findByRole('figure', { name: 'twoD_spectrum (arb. units)' }) // signal name + `units` attribute
  ).resolves.toBeVisible();

  // Signal with "image" interpretation
  await selectExplorerNode('image');
  await expect(findVisTabs()).resolves.toEqual([NexusVis.NxImage]);
  await expect(
    screen.findByRole('figure', { name: 'Interference fringes' }) // `long_name` attribute
  ).resolves.toBeVisible();

  // 2D complex signal with "spectrum" interpretation
  await selectExplorerNode('complex_spectrum');
  await expect(findVisTabs()).resolves.toEqual([NexusVis.NxSpectrum]);
  await expect(
    screen.findByRole('figure', { name: 'twoD_complex' }) // signal name (complex vis type is displayed as ordinate label)
  ).resolves.toBeVisible();

  // Signal with "rgb-image" interpretation
  await selectExplorerNode('rgb-image');
  await expect(findVisTabs()).resolves.toEqual([NexusVis.NxRGB]);
  await expect(
    screen.findByRole('figure', { name: 'RGB CMY DGW' }) // `long_name` attribute
  ).resolves.toBeVisible();
});

test('visualize NXdata group without explicit signal interpretation', async () => {
  // 2D signal (no interpretation)
  const { selectExplorerNode } = await renderApp(
    '/nexus_entry/nx_process/nx_data'
  );
  await expect(findVisTabs()).resolves.toEqual([
    NexusVis.NxSpectrum,
    NexusVis.NxImage,
  ]);
  await expect(findSelectedVisTab()).resolves.toBe(NexusVis.NxImage);
  await expect(
    screen.findByRole('figure', { name: 'NeXus 2D' }) // `title` dataset
  ).resolves.toBeVisible();

  // 1D signal (no interpretation)
  await selectExplorerNode('log_spectrum');
  await expect(findSelectedVisTab()).resolves.toBe(NexusVis.NxSpectrum);
  await expect(
    screen.findByRole('figure', { name: 'oneD' })
  ).resolves.toBeVisible(); // signal name

  // 2D complex signal (no interpretation)
  await selectExplorerNode('complex');
  await expect(findVisTabs()).resolves.toEqual([
    NexusVis.NxSpectrum,
    NexusVis.NxImage,
  ]);
  await expect(findSelectedVisTab()).resolves.toBe(NexusVis.NxImage);
  await expect(
    screen.findByRole('figure', { name: 'twoD_complex (amplitude)' }) // signal name + complex visualization type
  ).resolves.toBeVisible();

  // 2D signal and two 1D axes of same length (implicit scatter interpretation)
  await selectExplorerNode('scatter');
  await expect(findVisTabs()).resolves.toEqual([NexusVis.NxScatter]);
  await expect(
    screen.findByRole('figure', { name: 'scatter_data' }) // signal name
  ).resolves.toBeVisible();
});

test('visualize NXdata group with old-style signal', async () => {
  await renderApp('/nexus_entry/old-style');

  await expect(findVisTabs()).resolves.toEqual([
    NexusVis.NxSpectrum,
    NexusVis.NxImage,
  ]);
  await expect(findSelectedVisTab()).resolves.toBe(NexusVis.NxImage);

  await expect(
    screen.findByRole('figure', { name: 'twoD' }) // name of dataset with `signal` attribute
  ).resolves.toBeVisible();
});

test('visualize group with `default` attribute', async () => {
  // NXroot with relative path to NXentry group with relative path to NXdata group with 2D signal
  const { selectExplorerNode } = await renderApp();

  await expect(findVisTabs()).resolves.toEqual([
    NexusVis.NxSpectrum,
    NexusVis.NxImage,
  ]);
  await expect(findSelectedVisTab()).resolves.toBe(NexusVis.NxImage);
  await expect(
    screen.findByRole('figure', { name: 'NeXus 2D' }) // `title` dataset
  ).resolves.toBeVisible();

  // NXentry with relative path to NXdata group with 2D signal
  await selectExplorerNode('nexus_entry');
  await expect(findVisTabs()).resolves.toEqual([
    NexusVis.NxSpectrum,
    NexusVis.NxImage,
  ]);
  await expect(findSelectedVisTab()).resolves.toBe(NexusVis.NxImage);
  await expect(
    screen.findByRole('figure', { name: 'NeXus 2D' }) // `title` dataset
  ).resolves.toBeVisible();

  // NXentry with absolute path to NXdata group with 2D signal
  await selectExplorerNode('nx_process');
  await selectExplorerNode('absolute_default_path');
  await expect(findVisTabs()).resolves.toEqual([
    NexusVis.NxSpectrum,
    NexusVis.NxImage,
  ]);
  await expect(findSelectedVisTab()).resolves.toBe(NexusVis.NxImage);
  await expect(
    screen.findByRole('figure', { name: 'NeXus 2D' }) // `title` dataset
  ).resolves.toBeVisible();
});

test('visualize NXentry group with implicit default child NXdata group', async () => {
  await renderApp('/nexus_no_default');

  await expect(findVisTabs()).resolves.toEqual([NexusVis.NxSpectrum]);

  await expect(
    screen.findByRole('figure', { name: 'oneD' }) // signal name of NXdata group "spectrum"
  ).resolves.toBeVisible();
});

test('follow SILX styles on NXdata group', async () => {
  await renderApp('/nexus_entry/log_spectrum');
  await expect(
    screen.findAllByRole('button', { name: 'Log' })
  ).resolves.toHaveLength(2); // log for both axes
});

test('handle unknown/incompatible interpretation gracefully', async () => {
  const { selectExplorerNode } = await renderApp('/nexus_malformed');

  // Signal with unknown interpretation
  await selectExplorerNode('interpretation_unknown');
  await expect(findVisTabs()).resolves.toEqual([
    NexusVis.NxSpectrum,
    NexusVis.NxImage,
  ]); // fallback based on number of dimensions
  await expect(findSelectedVisTab()).resolves.toBe(NexusVis.NxImage);
  await expect(
    screen.findByRole('figure', { name: 'fourD' }) // signal name
  ).resolves.toBeVisible();

  // Signal with too few dimensions for "rgb-image" interpretation
  await selectExplorerNode('rgb-image_incompatible');
  await expect(findVisTabs()).resolves.toEqual([NexusVis.NxSpectrum]); // fallback based on number of dimensions
  await expect(
    screen.findByRole('figure', { name: 'oneD' }) // signal name
  ).resolves.toBeVisible();
});

test('show error/fallback for malformed NeXus entity', async () => {
  const errorSpy = mockConsoleMethod('error');

  const { selectExplorerNode } = await renderApp('/nexus_malformed');

  // `default` attribute points to non-existant entity
  await selectExplorerNode('default_not_found');
  await expect(
    screen.findByText('No entity found at /test')
  ).resolves.toBeVisible();
  errorSpy.mockClear();

  // No `signal` attribute
  await selectExplorerNode('no_signal');
  await expect(
    screen.findByText('No visualization available for this entity.')
  ).resolves.toBeInTheDocument();
  expect(errorSpy).not.toHaveBeenCalled();
  errorSpy.mockClear();

  // `signal` attribute points to non-existant dataset
  await selectExplorerNode('signal_not_found');
  await expect(
    screen.findByText('Expected "unknown" signal entity to exist')
  ).resolves.toBeVisible();
  errorSpy.mockClear();

  // Signal entity is not a dataset
  await selectExplorerNode('signal_not_dataset');
  await expect(
    screen.findByText('Expected "some_group" signal to be a dataset')
  ).resolves.toBeVisible();
  errorSpy.mockClear();

  // Old-style signal entity is not a dataset
  await selectExplorerNode('signal_old-style_not_dataset');
  await expect(
    screen.findByText('Expected old-style "some_group" signal to be a dataset')
  ).resolves.toBeVisible();
  errorSpy.mockClear();

  // Shape of signal dataset is not array
  await selectExplorerNode('signal_not_array');
  await expect(
    screen.findByText('Expected dataset to have array shape')
  ).resolves.toBeVisible();
  errorSpy.mockClear();

  // Type of signal dataset is not numeric
  await selectExplorerNode('signal_not_numeric');
  await expect(
    screen.findByText('Expected dataset to have numeric or complex type')
  ).resolves.toBeVisible();
  errorSpy.mockClear();

  errorSpy.mockRestore();
});

test('ignore malformed `SILX_style` attribute', async () => {
  const errorSpy = mockConsoleMethod('error');
  const warningSpy = mockConsoleMethod('warn');

  // Unknown keys, invalid values
  const { selectExplorerNode } = await renderApp(
    '/nexus_malformed/silx_style_unknown'
  );
  await expect(findVisTabs()).resolves.toEqual([NexusVis.NxSpectrum]);
  await expect(
    screen.findAllByRole('button', {
      name: 'Linear', // scales remain unchanged
    })
  ).resolves.toHaveLength(2);

  // Invalid JSON
  await selectExplorerNode('silx_style_malformed');
  await expect(findVisTabs()).resolves.toEqual([NexusVis.NxSpectrum]);
  expect(warningSpy).toHaveBeenCalledWith(
    "Malformed 'SILX_style' attribute: {" // warn in console
  );

  expect(errorSpy).not.toHaveBeenCalled(); // no error
  warningSpy.mockRestore();
  errorSpy.mockRestore();
});

test('cancel and retry slow fetch of NxSpectrum', async () => {
  const { user } = await renderApp({
    initialPath: '/resilience/slow_nx_spectrum',
    withFakeTimers: true,
  });

  // Select NXdata group with spectrum interpretation and start fetching dataset values
  await expect(screen.findByText(/Loading data/)).resolves.toBeVisible();

  // Cancel all fetches at once
  const errorSpy = mockConsoleMethod('error');
  await user.click(await screen.findByRole('button', { name: /Cancel/ }));

  await expect(screen.findByText('Request cancelled')).resolves.toBeVisible();
  expect(errorSpy).toHaveBeenCalledTimes(2); // React logs two stack traces
  errorSpy.mockRestore();

  // Retry all fetches at once
  await user.click(await screen.findByRole('button', { name: /Retry/ }));
  await expect(screen.findByText(/Loading data/)).resolves.toBeVisible();

  // Let fetches succeed
  jest.runAllTimers();

  await expect(screen.findByRole('figure')).resolves.toBeVisible();
});

test('cancel and retry slow fetch of NxImage', async () => {
  const { user } = await renderApp({
    initialPath: '/resilience/slow_nx_image',
    withFakeTimers: true,
  });

  // Select NXdata group with image interpretation and start fetching dataset values
  await expect(screen.findByText(/Loading data/)).resolves.toBeVisible();

  // Cancel all fetches at once
  const errorSpy = mockConsoleMethod('error');
  await user.click(await screen.findByRole('button', { name: /Cancel/ }));
  await expect(screen.findByText('Request cancelled')).resolves.toBeVisible();
  expect(errorSpy).toHaveBeenCalledTimes(2); // React logs two stack traces
  errorSpy.mockRestore();

  // Retry all fetches at once
  await user.click(await screen.findByRole('button', { name: /Retry/ }));
  await expect(screen.findByText(/Loading data/)).resolves.toBeVisible();

  // Let fetches succeed
  jest.runAllTimers();
  await expect(screen.findByRole('figure')).resolves.toBeVisible();
});

test('retry fetching automatically when re-selecting NxSpectrum', async () => {
  const { user, selectExplorerNode } = await renderApp({
    initialPath: '/resilience/slow_nx_spectrum',
    withFakeTimers: true,
  });

  // Select NXdata group with spectrum interpretation and start fetching dataset values
  await expect(screen.findByText(/Loading data/)).resolves.toBeVisible();

  // Cancel all fetches at once
  const errorSpy = mockConsoleMethod('error');
  await user.click(await screen.findByRole('button', { name: /Cancel/ }));
  await expect(screen.findByText('Request cancelled')).resolves.toBeVisible();
  expect(errorSpy).toHaveBeenCalledTimes(2); // React logs two stack traces
  errorSpy.mockRestore();

  // Switch to other entity with no visualization
  await selectExplorerNode('entities');
  await expect(screen.findByText(/No visualization/)).resolves.toBeVisible();

  // Select dataset again
  await selectExplorerNode('slow_nx_spectrum');
  await expect(screen.findByText(/Loading data/)).resolves.toBeVisible();

  // Let fetches succeed
  jest.runAllTimers();
  await expect(screen.findByRole('figure')).resolves.toBeVisible();
});

test('retry fetching automatically when selecting other NxImage slice', async () => {
  const { user } = await renderApp({
    initialPath: '/resilience/slow_nx_image',
    withFakeTimers: true,
  });

  // Select NXdata group with spectrum interpretation and start fetching dataset values
  await expect(screen.findByText(/Loading data/)).resolves.toBeVisible();

  // Cancel all fetches at once
  const errorSpy = mockConsoleMethod('error');
  await user.click(await screen.findByRole('button', { name: /Cancel/ }));
  await expect(screen.findByText('Request cancelled')).resolves.toBeVisible();
  expect(errorSpy).toHaveBeenCalledTimes(2); // React logs two stack traces
  errorSpy.mockRestore();

  // Move to other slice to retry fetching automatically
  const d0Slider = screen.getByRole('slider', { name: 'D0' });
  await user.type(d0Slider, '{PageUp}');
  await expect(screen.findByText(/Loading data/)).resolves.toBeVisible();

  // Let fetches succeed
  jest.runAllTimers();
  await expect(screen.findByRole('figure')).resolves.toBeVisible();

  // Move back to first slice to retry fetching it automatically
  await user.type(d0Slider, '{PageDown}');
  await expect(screen.findByText(/Loading data/)).resolves.toBeVisible();

  // Let fetch of first slice succeed
  jest.runAllTimers();
  await expect(screen.findByRole('figure')).resolves.toBeVisible();
  d0Slider.blur(); // remove focus to avoid state update after unmount
});
