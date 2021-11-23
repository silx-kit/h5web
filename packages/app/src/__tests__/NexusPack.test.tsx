import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  findVisSelectorTabs,
  mockConsoleMethod,
  renderApp,
  selectExplorerNode,
} from '../test-utils';
import { NexusVis } from '../vis-packs/nexus/visualizations';

test('visualize NXdata group with "spectrum" interpretation', async () => {
  await renderApp();
  await selectExplorerNode('nexus_entry/spectrum');

  const tabs = await findVisSelectorTabs();
  expect(tabs).toHaveLength(1);
  expect(tabs[0]).toHaveTextContent(NexusVis.NxSpectrum);

  expect(
    await screen.findByRole('figure', { name: 'twoD_spectrum (arb. units)' }) // signal name + `units` attribute
  ).toBeVisible();
});

test('visualize NXdata group with "image" interpretation', async () => {
  await renderApp();
  await selectExplorerNode('nexus_entry/image');

  const tabs = await findVisSelectorTabs();
  expect(tabs).toHaveLength(1);
  expect(tabs[0]).toHaveTextContent(NexusVis.NxImage);

  expect(
    await screen.findByRole('figure', { name: 'Interference fringes' }) // `long_name` attribute
  ).toBeVisible();
});

test('visualize NXdata group with 2D signal', async () => {
  await renderApp();
  await selectExplorerNode('nexus_entry/nx_process/nx_data');

  const tabs = await findVisSelectorTabs();
  expect(tabs).toHaveLength(1);
  expect(tabs[0]).toHaveTextContent(NexusVis.NxImage);

  expect(await screen.findByRole('figure', { name: 'NeXus 2D' })).toBeVisible(); // `title` dataset
});

test('visualize NXentry group with relative path to 2D default signal', async () => {
  await renderApp();
  await selectExplorerNode('nexus_entry');

  const tabs = await findVisSelectorTabs();
  expect(tabs).toHaveLength(1);
  expect(tabs[0]).toHaveTextContent(NexusVis.NxImage);

  expect(await screen.findByRole('figure', { name: 'NeXus 2D' })).toBeVisible(); // `title` dataset
});

test('visualize NXentry group with absolute path to 2D default signal', async () => {
  await renderApp();
  await selectExplorerNode('nexus_entry/nx_process/absolute_default_path');

  const tabs = await findVisSelectorTabs();
  expect(tabs).toHaveLength(1);
  expect(tabs[0]).toHaveTextContent(NexusVis.NxImage);

  expect(await screen.findByRole('figure', { name: 'NeXus 2D' })).toBeVisible(); // `title` dataset
});

test('visualize NXroot group with 2D default signal', async () => {
  await renderApp();

  const tabs = await findVisSelectorTabs();
  expect(tabs).toHaveLength(1);
  expect(tabs[0]).toHaveTextContent(NexusVis.NxImage);

  expect(await screen.findByRole('figure', { name: 'NeXus 2D' })).toBeVisible(); // `title` dataset
});

test('visualize NXdata group with 2D complex signal', async () => {
  await renderApp();
  await selectExplorerNode('nexus_entry/complex_image');

  const tabs = await findVisSelectorTabs();
  expect(tabs).toHaveLength(1);
  expect(tabs[0]).toHaveTextContent(NexusVis.NxImage);

  expect(
    await screen.findByRole('figure', { name: 'twoD_complex (amplitude)' }) // signal name + complex visualization type
  ).toBeVisible();
});

test('visualize NXdata group with 1D complex signal', async () => {
  await renderApp();
  await selectExplorerNode('nexus_entry/complex_spectrum');

  const tabs = await findVisSelectorTabs();
  expect(tabs).toHaveLength(1);
  expect(tabs[0]).toHaveTextContent(NexusVis.NxSpectrum);

  expect(
    await screen.findByRole('figure', { name: 'twoD_complex (amplitude)' }) // signal name + complex visualization type
  ).toBeVisible();
});

test('visualize NXdata group with "rgb-image" interpretation', async () => {
  await renderApp();
  await selectExplorerNode('nexus_entry/rgb-image');

  const tabs = await findVisSelectorTabs();
  expect(tabs).toHaveLength(1);
  expect(tabs[0]).toHaveTextContent(NexusVis.NxRGB);

  expect(
    await screen.findByRole('figure', { name: 'RGB CMY DGW' }) // `long_name` attribute
  ).toBeVisible();
});

test('follow SILX styles when visualizing NXdata group', async () => {
  await renderApp();
  await selectExplorerNode('nexus_entry/log_spectrum');

  const logSelectors = await screen.findAllByRole('button', { name: 'Log' });
  expect(logSelectors).toHaveLength(2); // `log_spectrum` requests both axes to be in log scale
});

test('visualize NXentry group with implicit default child NXdata group', async () => {
  await renderApp();
  await selectExplorerNode('nexus_no_default');

  const tabs = await findVisSelectorTabs();
  expect(tabs).toHaveLength(1);
  expect(tabs[0]).toHaveTextContent(NexusVis.NxSpectrum);

  expect(
    await screen.findByRole('figure', { name: 'oneD' }) // signal name of NXdata group "spectrum"
  ).toBeVisible();
});

test('show error when `default` entity is not found', async () => {
  await renderApp();

  const errorSpy = mockConsoleMethod('error');
  await selectExplorerNode('nexus_malformed/default_not_found');
  expect(await screen.findByText('No entity found at /test')).toBeVisible();

  expect(errorSpy).toHaveBeenCalledTimes(2); // React logs two stack traces
});

test('show error when `signal` entity is not found', async () => {
  await renderApp();

  const errorSpy = mockConsoleMethod('error');
  await selectExplorerNode('nexus_malformed/signal_not_found');
  expect(
    await screen.findByText('Expected "unknown" signal entity to exist')
  ).toBeVisible();

  expect(errorSpy).toHaveBeenCalledTimes(2); // React logs two stack traces
});

test('show error when `signal` entity is not a dataset', async () => {
  await renderApp();

  const errorSpy = mockConsoleMethod('error');
  await selectExplorerNode('nexus_malformed/signal_not_dataset');
  expect(
    await screen.findByText('Expected "some_group" signal to be a dataset')
  ).toBeVisible();

  expect(errorSpy).toHaveBeenCalledTimes(2); // React logs two stack traces
});

test('show error when `signal` dataset is not array', async () => {
  await renderApp();

  const errorSpy = mockConsoleMethod('error');
  await selectExplorerNode('nexus_malformed/signal_not_array');
  expect(
    await screen.findByText('Expected dataset to have array shape')
  ).toBeVisible();

  expect(errorSpy).toHaveBeenCalledTimes(2); // React logs two stack traces
});

test('show error when `signal` dataset is not numeric', async () => {
  await renderApp();

  const errorSpy = mockConsoleMethod('error');
  await selectExplorerNode('nexus_malformed/signal_not_numeric');
  expect(
    await screen.findByText('Expected dataset to have numeric or complex type')
  ).toBeVisible();

  expect(errorSpy).toHaveBeenCalledTimes(2); // React logs two stack traces
});

test('show fallback message when NXdata group has no `signal` attribute', async () => {
  await renderApp();
  await selectExplorerNode('nexus_malformed/no_signal');

  expect(
    await screen.findByText('No visualization available for this entity.')
  ).toBeInTheDocument();
});

test('visualize NXdata group with unknown interpretation', async () => {
  await renderApp();
  await selectExplorerNode('nexus_malformed/interpretation_unknown');

  const tabs = await findVisSelectorTabs();
  expect(tabs).toHaveLength(1);
  expect(tabs[0]).toHaveTextContent(NexusVis.NxImage); // support check falls back to signal dataset dimensions

  expect(
    await screen.findByRole('figure', { name: 'fourD' }) // signal name
  ).toBeVisible();
});

test('visualize NXdata group with "rgb-image" interpretation but incompatible signal', async () => {
  await renderApp();
  await selectExplorerNode('nexus_malformed/rgb-image_incompatible');

  const tabs = await findVisSelectorTabs();
  expect(tabs).toHaveLength(1);
  expect(tabs[0]).toHaveTextContent(NexusVis.NxSpectrum); // support check falls back to signal dataset dimensions

  expect(
    await screen.findByRole('figure', { name: 'oneD' }) // signal name
  ).toBeVisible();
});

test('ignore unknown SILX styles options and invalid values', async () => {
  await renderApp();
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
  await renderApp();

  const warningSpy = mockConsoleMethod('warn');
  await selectExplorerNode('nexus_malformed/silx_style_malformed');

  const tabs = await findVisSelectorTabs();
  expect(tabs).toHaveLength(1);
  expect(tabs[0]).toHaveTextContent(NexusVis.NxSpectrum);

  expect(warningSpy).toHaveBeenCalledTimes(1);
  expect(warningSpy).toHaveBeenCalledWith(
    "Malformed 'SILX_style' attribute: {"
  );
  warningSpy.mockRestore();
});

test('cancel and retry slow fetch of NxSpectrum', async () => {
  jest.useFakeTimers('modern');
  await renderApp();

  // Select NXdata group with spectrum interpretation and start fetching dataset values
  await selectExplorerNode('resilience/slow_nx_spectrum');
  expect(await screen.findByText(/Loading data/)).toBeVisible();

  // Cancel all fetches at once
  const errorSpy = mockConsoleMethod('error');
  userEvent.click(await screen.findByRole('button', { name: /Cancel/ }));
  expect(await screen.findByText('Request cancelled')).toBeVisible();
  expect(errorSpy).toHaveBeenCalledTimes(2); // React logs two stack traces
  errorSpy.mockRestore();

  // Retry all fetches at once
  userEvent.click(await screen.findByRole('button', { name: /Retry/ }));
  expect(await screen.findByText(/Loading data/)).toBeVisible();

  // Let fetches succeed
  jest.runAllTimers();

  expect(await screen.findByRole('figure')).toBeVisible();

  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

test('cancel and retry slow fetch of NxImage', async () => {
  jest.useFakeTimers('modern');
  await renderApp();

  // Select NXdata group with image interpretation and start fetching dataset values
  await selectExplorerNode('resilience/slow_nx_image');
  expect(await screen.findByText(/Loading data/)).toBeVisible();

  // Cancel all fetches at once
  const errorSpy = mockConsoleMethod('error');
  userEvent.click(await screen.findByRole('button', { name: /Cancel/ }));
  expect(await screen.findByText('Request cancelled')).toBeVisible();
  expect(errorSpy).toHaveBeenCalledTimes(2); // React logs two stack traces
  errorSpy.mockRestore();

  // Retry all fetches at once
  userEvent.click(await screen.findByRole('button', { name: /Retry/ }));
  expect(await screen.findByText(/Loading data/)).toBeVisible();

  // Let fetches succeed
  jest.runAllTimers();
  expect(await screen.findByRole('figure')).toBeVisible();

  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

test('retry fetching automatically when re-selecting NxSpectrum', async () => {
  jest.useFakeTimers('modern');
  await renderApp();

  // Select NXdata group with spectrum interpretation and start fetching dataset values
  await selectExplorerNode('resilience/slow_nx_spectrum');
  expect(await screen.findByText(/Loading data/)).toBeVisible();

  // Cancel all fetches at once
  const errorSpy = mockConsoleMethod('error');
  userEvent.click(await screen.findByRole('button', { name: /Cancel/ }));
  expect(await screen.findByText('Request cancelled')).toBeVisible();
  expect(errorSpy).toHaveBeenCalledTimes(2); // React logs two stack traces
  errorSpy.mockRestore();

  // Switch to other entity with no visualization
  await selectExplorerNode('entities');
  expect(await screen.findByText(/No visualization/)).toBeVisible();

  // Select dataset again
  await selectExplorerNode('slow_nx_spectrum');
  expect(await screen.findByText(/Loading data/)).toBeVisible();

  // Let fetches succeed
  jest.runAllTimers();
  expect(await screen.findByRole('figure')).toBeVisible();

  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

test('retry fetching automatically when re-selecting NxImage', async () => {
  jest.useFakeTimers('modern');
  await renderApp();

  // Select NXdata group with image interpretation and start fetching dataset values
  await selectExplorerNode('resilience/slow_nx_image');
  expect(await screen.findByText(/Loading data/)).toBeVisible();

  // Cancel all fetches at once
  const errorSpy = mockConsoleMethod('error');
  userEvent.click(await screen.findByRole('button', { name: /Cancel/ }));
  expect(await screen.findByText('Request cancelled')).toBeVisible();
  expect(errorSpy).toHaveBeenCalledTimes(2); // React logs two stack traces
  errorSpy.mockRestore();

  // Switch to other entity with no visualization
  await selectExplorerNode('entities');
  expect(await screen.findByText(/No visualization/)).toBeVisible();

  // Select dataset again
  await selectExplorerNode('slow_nx_image');
  expect(await screen.findByText(/Loading data/)).toBeVisible();

  // Let fetches succeed
  jest.runAllTimers();
  expect(await screen.findByRole('figure')).toBeVisible();

  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

test('retry fetching automatically when selecting other NxSpectrum slice', async () => {
  jest.useFakeTimers('modern');
  await renderApp();

  // Select NXdata group with spectrum interpretation and start fetching dataset values
  await selectExplorerNode('resilience/slow_nx_spectrum');
  expect(await screen.findByText(/Loading data/)).toBeVisible();

  // Cancel all fetches at once
  const errorSpy = mockConsoleMethod('error');
  userEvent.click(await screen.findByRole('button', { name: /Cancel/ }));
  expect(await screen.findByText('Request cancelled')).toBeVisible();
  expect(errorSpy).toHaveBeenCalledTimes(2); // React logs two stack traces
  errorSpy.mockRestore();

  // Move to other slice to retry fetching automatically
  const d0Slider = screen.getByRole('slider', { name: 'Dimension slider' });
  d0Slider.focus();
  userEvent.keyboard('{PageUp}');
  expect(await screen.findByText(/Loading data/)).toBeVisible();

  // Let fetches succeed
  jest.runAllTimers();
  expect(await screen.findByRole('figure')).toBeVisible();

  // Check that entire spectrum signal is fetched
  userEvent.keyboard('{PageDown}');
  expect(await screen.findByRole('figure')).toBeVisible();
  d0Slider.blur(); // remove focus to avoid state update after unmount

  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

test('retry fetching supporting datasets automatically when selecting other NxImage slice', async () => {
  jest.useFakeTimers('modern');
  await renderApp();

  // Select NXdata group with image interpretation and start fetching dataset values
  await selectExplorerNode('resilience/slow_nx_image');
  expect(await screen.findByText(/Loading data/)).toBeVisible();

  // Cancel all fetches at once
  const errorSpy = mockConsoleMethod('error');
  userEvent.click(await screen.findByRole('button', { name: /Cancel/ }));
  expect(await screen.findByText('Request cancelled')).toBeVisible();
  expect(errorSpy).toHaveBeenCalledTimes(2); // React logs two stack traces
  errorSpy.mockRestore();

  // Move to other slice to fetch new slice and retry fetching supporting datasets automatically
  const d0Slider = screen.getByRole('slider', { name: 'Dimension slider' });
  d0Slider.focus();
  userEvent.keyboard('{PageUp}');
  expect(await screen.findByText(/Loading data/)).toBeVisible();

  // Let fetches succeed
  jest.runAllTimers();
  expect(await screen.findByRole('figure')).toBeVisible();

  // Move back to first slice to retry fetching it automatically
  userEvent.keyboard('{PageDown}');
  expect(await screen.findByText(/Loading data/)).toBeVisible();

  // Let fetch of first slice succeed
  jest.runAllTimers();
  expect(await screen.findByRole('figure')).toBeVisible();
  d0Slider.blur(); // remove focus to avoid state update after unmount

  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});
