import { screen } from '@testing-library/react';

import {
  findVisSelectorTabs,
  mockConsoleMethod,
  renderApp,
} from '../test-utils';
import { NexusVis } from '../vis-packs/nexus/visualizations';

test('visualize NXdata group with "spectrum" interpretation', async () => {
  const { selectExplorerNode } = await renderApp();
  await selectExplorerNode('nexus_entry/spectrum');

  const tabs = await findVisSelectorTabs();
  expect(tabs).toHaveLength(1);
  expect(tabs[0]).toHaveTextContent(NexusVis.NxSpectrum);

  await expect(
    screen.findByRole('figure', { name: 'twoD_spectrum (arb. units)' }) // signal name + `units` attribute
  ).resolves.toBeVisible();
});

test('visualize NXdata group with "image" interpretation', async () => {
  const { selectExplorerNode } = await renderApp();
  await selectExplorerNode('nexus_entry/image');

  const tabs = await findVisSelectorTabs();
  expect(tabs).toHaveLength(1);
  expect(tabs[0]).toHaveTextContent(NexusVis.NxImage);

  await expect(
    screen.findByRole('figure', { name: 'Interference fringes' }) // `long_name` attribute
  ).resolves.toBeVisible();
});

test('visualize NXdata group with 2D signal', async () => {
  const { selectExplorerNode } = await renderApp();
  await selectExplorerNode('nexus_entry/nx_process/nx_data');

  const tabs = await findVisSelectorTabs();
  expect(tabs).toHaveLength(2);
  expect(tabs[0]).toHaveTextContent(NexusVis.NxSpectrum);
  expect(tabs[1]).toHaveTextContent(NexusVis.NxImage);

  await expect(
    screen.findByRole('figure', { name: 'NeXus 2D' }) // `title` dataset
  ).resolves.toBeVisible();
});

test('visualize NXdata group with 1D signal and two 1D axes of same length', async () => {
  const { selectExplorerNode } = await renderApp();
  await selectExplorerNode('nexus_entry/scatter');

  const tabs = await findVisSelectorTabs();
  expect(tabs).toHaveLength(1);
  expect(tabs[0]).toHaveTextContent(NexusVis.NxScatter);

  await expect(
    screen.findByRole('figure', { name: 'scatter_data' })
  ).resolves.toBeVisible();
});

test('visualize NXentry group with relative path to 2D default signal', async () => {
  const { selectExplorerNode } = await renderApp();
  await selectExplorerNode('nexus_entry');

  const tabs = await findVisSelectorTabs();
  expect(tabs).toHaveLength(2);
  expect(tabs[0]).toHaveTextContent(NexusVis.NxSpectrum);
  expect(tabs[1]).toHaveTextContent(NexusVis.NxImage);

  await expect(
    screen.findByRole('figure', { name: 'NeXus 2D' }) // `title` dataset
  ).resolves.toBeVisible();
});

test('visualize NXentry group with absolute path to 2D default signal', async () => {
  const { selectExplorerNode } = await renderApp();
  await selectExplorerNode('nexus_entry/nx_process/absolute_default_path');

  const tabs = await findVisSelectorTabs();
  expect(tabs).toHaveLength(2);
  expect(tabs[0]).toHaveTextContent(NexusVis.NxSpectrum);
  expect(tabs[1]).toHaveTextContent(NexusVis.NxImage);

  await expect(
    screen.findByRole('figure', { name: 'NeXus 2D' }) // `title` dataset
  ).resolves.toBeVisible();
});

test('visualize NXroot group with 2D default signal', async () => {
  await renderApp();

  const tabs = await findVisSelectorTabs();
  expect(tabs).toHaveLength(2);
  expect(tabs[0]).toHaveTextContent(NexusVis.NxSpectrum);
  expect(tabs[1]).toHaveTextContent(NexusVis.NxImage);

  await expect(
    screen.findByRole('figure', { name: 'NeXus 2D' }) // `title` dataset
  ).resolves.toBeVisible();
});

test('visualize NXdata group with 2D complex signal', async () => {
  const { selectExplorerNode } = await renderApp();
  await selectExplorerNode('nexus_entry/complex');

  const tabs = await findVisSelectorTabs();
  expect(tabs).toHaveLength(2);
  expect(tabs[0]).toHaveTextContent(NexusVis.NxSpectrum);
  expect(tabs[1]).toHaveTextContent(NexusVis.NxImage);

  await expect(
    screen.findByRole('figure', { name: 'twoD_complex (amplitude)' }) // signal name + complex visualization type
  ).resolves.toBeVisible();
});

test('visualize NXdata group with 2D complex signal and "spectrum" interpretation', async () => {
  const { selectExplorerNode } = await renderApp();
  await selectExplorerNode('nexus_entry/complex_spectrum');

  const tabs = await findVisSelectorTabs();
  expect(tabs).toHaveLength(1);
  expect(tabs[0]).toHaveTextContent(NexusVis.NxSpectrum);

  await expect(
    screen.findByRole('figure', { name: 'twoD_complex' }) // signal name (complex vis type is displayed as ordinate label)
  ).resolves.toBeVisible();
});

test('visualize NXdata group with "rgb-image" interpretation', async () => {
  const { selectExplorerNode } = await renderApp();
  await selectExplorerNode('nexus_entry/rgb-image');

  const tabs = await findVisSelectorTabs();
  expect(tabs).toHaveLength(1);
  expect(tabs[0]).toHaveTextContent(NexusVis.NxRGB);

  await expect(
    screen.findByRole('figure', { name: 'RGB CMY DGW' }) // `long_name` attribute
  ).resolves.toBeVisible();
});

test('follow SILX styles when visualizing NXdata group', async () => {
  const { selectExplorerNode } = await renderApp();
  await selectExplorerNode('nexus_entry/log_spectrum');

  const logSelectors = await screen.findAllByRole('button', { name: 'Log' });
  expect(logSelectors).toHaveLength(2); // `log_spectrum` requests both axes to be in log scale
});

test('visualize NXentry group with implicit default child NXdata group', async () => {
  const { selectExplorerNode } = await renderApp();
  await selectExplorerNode('nexus_no_default');

  const tabs = await findVisSelectorTabs();
  expect(tabs).toHaveLength(1);
  expect(tabs[0]).toHaveTextContent(NexusVis.NxSpectrum);

  await expect(
    screen.findByRole('figure', { name: 'oneD' }) // signal name of NXdata group "spectrum"
  ).resolves.toBeVisible();
});

test('show error when `default` entity is not found', async () => {
  const { selectExplorerNode } = await renderApp();

  const errorSpy = mockConsoleMethod('error');
  await selectExplorerNode('nexus_malformed/default_not_found');
  await expect(
    screen.findByText('No entity found at /test')
  ).resolves.toBeVisible();

  expect(errorSpy).toHaveBeenCalledTimes(2); // React logs two stack traces
});

test('show error when `signal` entity is not found', async () => {
  const { selectExplorerNode } = await renderApp();

  const errorSpy = mockConsoleMethod('error');
  await selectExplorerNode('nexus_malformed/signal_not_found');
  await expect(
    screen.findByText('Expected "unknown" signal entity to exist')
  ).resolves.toBeVisible();

  expect(errorSpy).toHaveBeenCalledTimes(2); // React logs two stack traces
});

test('show error when `signal` entity is not a dataset', async () => {
  const { selectExplorerNode } = await renderApp();

  const errorSpy = mockConsoleMethod('error');
  await selectExplorerNode('nexus_malformed/signal_not_dataset');
  await expect(
    screen.findByText('Expected "some_group" signal to be a dataset')
  ).resolves.toBeVisible();

  expect(errorSpy).toHaveBeenCalledTimes(2); // React logs two stack traces
});

test('show error when `signal` dataset is not array', async () => {
  const { selectExplorerNode } = await renderApp();

  const errorSpy = mockConsoleMethod('error');
  await selectExplorerNode('nexus_malformed/signal_not_array');
  await expect(
    screen.findByText('Expected dataset to have array shape')
  ).resolves.toBeVisible();

  expect(errorSpy).toHaveBeenCalledTimes(2); // React logs two stack traces
});

test('show error when `signal` dataset is not numeric', async () => {
  const { selectExplorerNode } = await renderApp();

  const errorSpy = mockConsoleMethod('error');
  await selectExplorerNode('nexus_malformed/signal_not_numeric');
  await expect(
    screen.findByText('Expected dataset to have numeric or complex type')
  ).resolves.toBeVisible();

  expect(errorSpy).toHaveBeenCalledTimes(2); // React logs two stack traces
});

test('show fallback message when NXdata group has no `signal` attribute', async () => {
  const { selectExplorerNode } = await renderApp();
  await selectExplorerNode('nexus_malformed/no_signal');

  await expect(
    screen.findByText('No visualization available for this entity.')
  ).resolves.toBeInTheDocument();
});

test('visualize NXdata group with unknown interpretation', async () => {
  const { selectExplorerNode } = await renderApp();
  await selectExplorerNode('nexus_malformed/interpretation_unknown');

  const tabs = await findVisSelectorTabs();
  expect(tabs).toHaveLength(2); // support check falls back to signal dataset dimensions (4D supports both Image and Spectrum)
  expect(tabs[0]).toHaveTextContent(NexusVis.NxSpectrum);
  expect(tabs[1]).toHaveTextContent(NexusVis.NxImage);

  await expect(
    screen.findByRole('figure', { name: 'fourD' }) // signal name
  ).resolves.toBeVisible();
});

test('visualize NXdata group with "rgb-image" interpretation but incompatible signal', async () => {
  const { selectExplorerNode } = await renderApp();
  await selectExplorerNode('nexus_malformed/rgb-image_incompatible');

  const tabs = await findVisSelectorTabs();
  expect(tabs).toHaveLength(1); // support check falls back to signal dataset dimensions (1D supports only Spectrum)
  expect(tabs[0]).toHaveTextContent(NexusVis.NxSpectrum);

  await expect(
    screen.findByRole('figure', { name: 'oneD' }) // signal name
  ).resolves.toBeVisible();
});

test('ignore unknown `SILX_style` options and invalid values', async () => {
  const { selectExplorerNode } = await renderApp();
  await selectExplorerNode('nexus_malformed/silx_style_unknown');

  const errorSpy = mockConsoleMethod('error');

  const tabs = await findVisSelectorTabs();
  expect(tabs).toHaveLength(1);
  expect(tabs[0]).toHaveTextContent(NexusVis.NxSpectrum);

  const scaleSelectors = await screen.findAllByRole('button', {
    name: 'Linear', // the scales of both axes remain unchanged
  });
  expect(scaleSelectors).toHaveLength(2);

  expect(errorSpy).not.toHaveBeenCalled(); // no error
  errorSpy.mockRestore();
});

test('warn in console when `SILX_style` attribute is not valid JSON', async () => {
  const { selectExplorerNode } = await renderApp();

  const warningSpy = mockConsoleMethod('warn');
  await selectExplorerNode('nexus_malformed/silx_style_malformed');

  const tabs = await findVisSelectorTabs();
  expect(tabs).toHaveLength(1);
  expect(tabs[0]).toHaveTextContent(NexusVis.NxSpectrum);

  expect(warningSpy).toHaveBeenCalledWith(
    "Malformed 'SILX_style' attribute: {"
  );
  warningSpy.mockRestore();
});

test('cancel and retry slow fetch of NxSpectrum', async () => {
  jest.useFakeTimers('modern');
  const { user, selectExplorerNode } = await renderApp();

  // Select NXdata group with spectrum interpretation and start fetching dataset values
  await selectExplorerNode('resilience/slow_nx_spectrum');
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

  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

test('cancel and retry slow fetch of NxImage', async () => {
  jest.useFakeTimers('modern');
  const { user, selectExplorerNode } = await renderApp();

  // Select NXdata group with image interpretation and start fetching dataset values
  await selectExplorerNode('resilience/slow_nx_image');
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

  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

test('retry fetching automatically when re-selecting NxSpectrum', async () => {
  jest.useFakeTimers('modern');
  const { user, selectExplorerNode } = await renderApp();

  // Select NXdata group with spectrum interpretation and start fetching dataset values
  await selectExplorerNode('resilience/slow_nx_spectrum');
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

  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

test('retry fetching automatically when re-selecting NxImage', async () => {
  jest.useFakeTimers('modern');
  const { user, selectExplorerNode } = await renderApp();

  // Select NXdata group with image interpretation and start fetching dataset values
  await selectExplorerNode('resilience/slow_nx_image');
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
  await selectExplorerNode('slow_nx_image');
  await expect(screen.findByText(/Loading data/)).resolves.toBeVisible();

  // Let fetches succeed
  jest.runAllTimers();
  await expect(screen.findByRole('figure')).resolves.toBeVisible();

  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

test('retry fetching automatically when selecting other NxSpectrum slice', async () => {
  jest.useFakeTimers('modern');
  const { user, selectExplorerNode } = await renderApp();

  // Select NXdata group with spectrum interpretation and start fetching dataset values
  await selectExplorerNode('resilience/slow_nx_spectrum');
  await expect(screen.findByText(/Loading data/)).resolves.toBeVisible();

  // Cancel all fetches at once
  const errorSpy = mockConsoleMethod('error');
  await user.click(await screen.findByRole('button', { name: /Cancel/ }));
  await expect(screen.findByText('Request cancelled')).resolves.toBeVisible();
  expect(errorSpy).toHaveBeenCalledTimes(2); // React logs two stack traces
  errorSpy.mockRestore();

  // Move to other slice to retry fetching automatically
  const d0Slider = screen.getByRole('slider', { name: 'Dimension slider' });
  d0Slider.focus();
  await user.keyboard('{PageUp}');
  await expect(screen.findByText(/Loading data/)).resolves.toBeVisible();

  // Let fetches succeed
  jest.runAllTimers();
  await expect(screen.findByRole('figure')).resolves.toBeVisible();

  // Move back to first slice to retry fetching it automatically
  await user.keyboard('{PageDown}');
  await expect(screen.findByText(/Loading data/)).resolves.toBeVisible();

  // Let fetch of first slice succeed
  jest.runAllTimers();
  await expect(screen.findByRole('figure')).resolves.toBeVisible();
  d0Slider.blur(); // remove focus to avoid state update after unmount

  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

test('retry fetching supporting datasets automatically when selecting other NxImage slice', async () => {
  jest.useFakeTimers('modern');
  const { user, selectExplorerNode } = await renderApp();

  // Select NXdata group with image interpretation and start fetching dataset values
  await selectExplorerNode('resilience/slow_nx_image');
  await expect(screen.findByText(/Loading data/)).resolves.toBeVisible();

  // Cancel all fetches at once
  const errorSpy = mockConsoleMethod('error');
  await user.click(await screen.findByRole('button', { name: /Cancel/ }));
  await expect(screen.findByText('Request cancelled')).resolves.toBeVisible();
  expect(errorSpy).toHaveBeenCalledTimes(2); // React logs two stack traces
  errorSpy.mockRestore();

  // Move to other slice to fetch new slice and retry fetching supporting datasets automatically
  const d0Slider = screen.getByRole('slider', { name: 'Dimension slider' });
  d0Slider.focus();
  await user.keyboard('{PageUp}');
  await expect(screen.findByText(/Loading data/)).resolves.toBeVisible();

  // Let fetches succeed
  jest.runAllTimers();
  await expect(screen.findByRole('figure')).resolves.toBeVisible();

  // Move back to first slice to retry fetching it automatically
  await user.keyboard('{PageDown}');
  await expect(screen.findByText(/Loading data/)).resolves.toBeVisible();

  // Let fetch of first slice succeed
  jest.runAllTimers();
  await expect(screen.findByRole('figure')).resolves.toBeVisible();
  d0Slider.blur(); // remove focus to avoid state update after unmount

  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});
