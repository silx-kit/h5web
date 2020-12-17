import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { mockValues } from '../providers/mock/data';
import App from '../App';
import {
  findVisSelectorTabs,
  mockConsoleMethod,
  queryVisSelector,
  renderApp,
  selectExplorerNode,
} from '../test-utils';
import { MockProvider } from '../../packages/app';
import { Vis } from '../visualizations';

describe('Visualizer', () => {
  test('show "Raw" tab for dataset with complex type', async () => {
    renderApp();
    await selectExplorerNode('entities/raw');

    const tabs = await findVisSelectorTabs();
    expect(tabs).toHaveLength(1);
    expect(tabs[0]).toHaveTextContent(Vis.Raw);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
  });

  test('show "Scalar" tab for scalar dataset with basic type', async () => {
    renderApp();
    await selectExplorerNode('entities/scalar_int');

    const tabs = await findVisSelectorTabs();
    expect(tabs).toHaveLength(1);
    expect(tabs[0]).toHaveTextContent(Vis.Scalar);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
  });

  test('show "Matrix" and "Line" tabs for 1D dataset', async () => {
    renderApp();
    await selectExplorerNode('nD_datasets/oneD');

    const tabs = await findVisSelectorTabs();
    expect(tabs).toHaveLength(2);
    expect(tabs[0]).toHaveTextContent(Vis.Matrix);
    expect(tabs[1]).toHaveTextContent(Vis.Line);
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
  });

  test('show "Matrix", "Line" and "Heatmap" tabs for 2D datasets', async () => {
    renderApp();
    await selectExplorerNode('nD_datasets/twoD');

    const tabs = await findVisSelectorTabs();
    expect(tabs).toHaveLength(3);
    expect(tabs[0]).toHaveTextContent(Vis.Matrix);
    expect(tabs[1]).toHaveTextContent(Vis.Line);
    expect(tabs[2]).toHaveTextContent(Vis.Heatmap);
    expect(tabs[2]).toHaveAttribute('aria-selected', 'true');
  });

  test('show "NX Spectrum" tab for NXdata group with "spectrum" interpretation', async () => {
    renderApp();
    await selectExplorerNode('nexus_entry/spectrum');

    const tabs = await findVisSelectorTabs();
    expect(tabs).toHaveLength(1);
    expect(tabs[0]).toHaveTextContent(Vis.NxSpectrum);
  });

  test('show "NX Image" tab for NXdata group with "image" interpretation', async () => {
    renderApp();
    await selectExplorerNode('nexus_entry/image');

    const tabs = await findVisSelectorTabs();
    expect(tabs).toHaveLength(1);
    expect(tabs[0]).toHaveTextContent(Vis.NxImage);
  });

  test('show "NX Image" tab for NXdata group with 2D signal', async () => {
    renderApp();
    await selectExplorerNode('nexus_entry/nx_process/nx_data');

    const tabs = await findVisSelectorTabs();
    expect(tabs).toHaveLength(1);
    expect(tabs[0]).toHaveTextContent(Vis.NxImage);
  });

  test('show "NX Image" tab for NXentry group with 2D default signal', async () => {
    renderApp();
    await selectExplorerNode('nexus_entry');

    const tabs = await findVisSelectorTabs();
    expect(tabs).toHaveLength(1);
    expect(tabs[0]).toHaveTextContent(Vis.NxImage);
  });

  test('show "NX Image" tab for NXroot group with 2D default signal', async () => {
    renderApp();

    const tabs = await findVisSelectorTabs();
    expect(tabs).toHaveLength(1);
    expect(tabs[0]).toHaveTextContent(Vis.NxImage);
  });

  test('switch between visualisations', async () => {
    renderApp();
    await selectExplorerNode('nD_datasets/oneD');

    const lineTab = await screen.findByRole('tab', { name: 'Line' });
    expect(lineTab).toBeVisible();
    expect(lineTab).toHaveAttribute('aria-selected', 'true');

    const matrixTab = screen.getByRole('tab', { name: 'Matrix' });
    expect(matrixTab).toBeVisible();
    expect(matrixTab).toHaveAttribute('aria-selected', 'false');

    // Switch to Matrix visualisation
    fireEvent.click(matrixTab);
    expect(matrixTab).toHaveAttribute('aria-selected', 'true');
    expect(lineTab).toHaveAttribute('aria-selected', 'false');
  });

  test('show fallback message when no visualization is supported', async () => {
    renderApp();
    await selectExplorerNode('entities'); // simple group

    expect(await screen.findByText('Nothing to visualize')).toBeInTheDocument();
    expect(queryVisSelector()).not.toBeInTheDocument();
  });

  test("show error when dataset value can't be fetched", async () => {
    render(
      <MockProvider errorOnId="raw">
        <App />
      </MockProvider>
    );

    const { consoleMock, resetConsole } = mockConsoleMethod('error');
    await selectExplorerNode('entities/raw');

    expect(await screen.findByText('error')).toBeVisible();
    expect(consoleMock).toHaveBeenCalledTimes(2); // React logs two stack traces
    resetConsole();

    await selectExplorerNode('scalar_str');
    expect(await screen.findByText(mockValues.scalar_str)).toBeVisible();
  });

  test('show error when encountering malformed NeXus metadata', async () => {
    renderApp();
    await selectExplorerNode('nexus_malformed');

    await selectExplorerNode('default_not_found');
    expect(await screen.findByText(/entity at path/u)).toBeVisible();

    await selectExplorerNode('no_signal');
    expect(await screen.findByText(/'signal' attribute/u)).toBeVisible();

    await selectExplorerNode('signal_not_found');
    expect(await screen.findByText(/to exist/u)).toBeVisible();
  });
});
