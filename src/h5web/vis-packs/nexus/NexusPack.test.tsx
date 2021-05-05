import { screen } from '@testing-library/react';
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
  // expect(await screen.findByRole('figure')).toBeVisible();

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
