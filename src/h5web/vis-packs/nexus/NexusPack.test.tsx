import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  findVisSelectorTabs,
  mockConsoleMethod,
  renderApp,
  selectExplorerNode,
} from '../../test-utils';
import { NexusVis } from './visualizations';

test('visualize NXdata group with "spectrum" interpretation', async () => {
  await renderApp();
  await selectExplorerNode('nexus_entry/spectrum');

  const tabs = await findVisSelectorTabs();
  expect(tabs).toHaveLength(1);
  expect(tabs[0]).toHaveTextContent(NexusVis.NxSpectrum);
});

test('visualize NXdata group with "image" interpretation', async () => {
  await renderApp();
  await selectExplorerNode('nexus_entry/image');

  const tabs = await findVisSelectorTabs();
  expect(tabs).toHaveLength(1);
  expect(tabs[0]).toHaveTextContent(NexusVis.NxImage);
});

test('visualize NXdata group with 2D signal', async () => {
  await renderApp();
  await selectExplorerNode('nexus_entry/nx_process/nx_data');

  const tabs = await findVisSelectorTabs();
  expect(tabs).toHaveLength(1);
  expect(tabs[0]).toHaveTextContent(NexusVis.NxImage);
});

test('visualize NXentry group with relative path to 2D default signal', async () => {
  await renderApp();
  await selectExplorerNode('nexus_entry');

  const tabs = await findVisSelectorTabs();
  expect(tabs).toHaveLength(1);
  expect(tabs[0]).toHaveTextContent(NexusVis.NxImage);
});

test('visualize NXentry group with absolute path to 2D default signal', async () => {
  await renderApp();
  await selectExplorerNode('nexus_entry/nx_process/absolute_default_path');

  const tabs = await findVisSelectorTabs();
  expect(tabs).toHaveLength(1);
  expect(tabs[0]).toHaveTextContent(NexusVis.NxImage);
});

test('visualize NXroot group with 2D default signal', async () => {
  await renderApp();

  const tabs = await findVisSelectorTabs();
  expect(tabs).toHaveLength(1);
  expect(tabs[0]).toHaveTextContent(NexusVis.NxImage);
});

test('visualize NXdata group with 2D complex signal', async () => {
  await renderApp();
  await selectExplorerNode('nexus_entry/complex_image');

  const tabs = await findVisSelectorTabs();
  expect(tabs).toHaveLength(1);
  expect(tabs[0]).toHaveTextContent(NexusVis.NxImage);
});

test('visualize NXdata group with 1D complex signal', async () => {
  await renderApp();
  await selectExplorerNode('nexus_entry/complex_spectrum');

  const tabs = await findVisSelectorTabs();
  expect(tabs).toHaveLength(1);
  expect(tabs[0]).toHaveTextContent(NexusVis.NxSpectrum);
});

test('visualize NXdata group with "rgb-image" interpretation', async () => {
  await renderApp();
  await selectExplorerNode('nexus_entry/rgb-image');

  const tabs = await findVisSelectorTabs();
  expect(tabs).toHaveLength(1);
  expect(tabs[0]).toHaveTextContent(NexusVis.NxRGB);
});

test('show error when encountering malformed NeXus metadata', async () => {
  await renderApp();

  const errorSpy = mockConsoleMethod('error');
  await selectExplorerNode('nexus_malformed');

  await selectExplorerNode('default_not_string');
  expect(await screen.findByText(/to be a string/)).toBeVisible();

  await selectExplorerNode('default_not_found');
  expect(
    await screen.findByText(/No entity found at NeXus default path/)
  ).toBeVisible();

  await selectExplorerNode('no_signal');
  expect(await screen.findByText(/'signal' attribute/)).toBeVisible();

  await selectExplorerNode('signal_not_found');
  expect(await screen.findByText(/to exist/)).toBeVisible();

  expect(errorSpy).toHaveBeenCalledTimes(8); // React logs two stack traces per error
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

  // Switch to other entity
  await selectExplorerNode('resilience');
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

  // Switch to other entity
  await selectExplorerNode('resilience');
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
