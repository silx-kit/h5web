import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { mockValues } from '../../packages/lib';
import App from '../App';
import { prepareForConsoleError, renderApp } from '../test-utils';
import { MockProvider } from '../../packages/app';
import { Vis } from '../visualizations';

async function findVisSelectorTabs() {
  return within(
    await screen.findByRole('tablist', { name: 'Visualization' })
  ).getAllByRole('tab');
}

describe('Visualizer', () => {
  test('show "Raw" tab for dataset with complex type', async () => {
    renderApp();

    fireEvent.click(await screen.findByRole('treeitem', { name: 'entities' }));
    fireEvent.click(screen.getByRole('treeitem', { name: 'raw' }));

    const tabs = await findVisSelectorTabs();
    expect(tabs).toHaveLength(1);
    expect(tabs[0]).toHaveTextContent(Vis.Raw);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
  });

  test('show "Scalar" tab for scalar dataset with basic type', async () => {
    renderApp();

    fireEvent.click(await screen.findByRole('treeitem', { name: 'entities' }));
    fireEvent.click(screen.getByRole('treeitem', { name: 'scalar_int' }));

    const tabs = await findVisSelectorTabs();
    expect(tabs).toHaveLength(1);
    expect(tabs[0]).toHaveTextContent(Vis.Scalar);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
  });

  test('show "Matrix" and "Line" tabs for 1D dataset', async () => {
    renderApp();

    fireEvent.click(
      await screen.findByRole('treeitem', { name: 'nD_datasets' })
    );
    fireEvent.click(screen.getByRole('treeitem', { name: 'oneD' }));

    const tabs = await findVisSelectorTabs();
    expect(tabs).toHaveLength(2);
    expect(tabs[0]).toHaveTextContent(Vis.Matrix);
    expect(tabs[1]).toHaveTextContent(Vis.Line);
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
  });

  test('show "Matrix", "Line" and "Heatmap" tabs for 2D datasets', async () => {
    renderApp();

    fireEvent.click(
      await screen.findByRole('treeitem', { name: 'nD_datasets' })
    );
    fireEvent.click(screen.getByRole('treeitem', { name: 'twoD' }));

    const tabs = await findVisSelectorTabs();
    expect(tabs).toHaveLength(3);
    expect(tabs[0]).toHaveTextContent(Vis.Matrix);
    expect(tabs[1]).toHaveTextContent(Vis.Line);
    expect(tabs[2]).toHaveTextContent(Vis.Heatmap);
    expect(tabs[2]).toHaveAttribute('aria-selected', 'true');
  });

  test('show "NX Spectrum" tab for NXdata group with "spectrum" interpretation', async () => {
    renderApp();

    fireEvent.click(
      await screen.findByRole('treeitem', { name: 'nexus_entry' })
    );
    fireEvent.click(screen.getByRole('treeitem', { name: 'spectrum' }));

    const tabs = await findVisSelectorTabs();
    expect(tabs).toHaveLength(1);
    expect(tabs[0]).toHaveTextContent(Vis.NxSpectrum);
  });

  test('show "NX Image" tab for NXdata group with "image" interpretation', async () => {
    renderApp();

    fireEvent.click(
      await screen.findByRole('treeitem', { name: 'nexus_entry' })
    );
    fireEvent.click(screen.getByRole('treeitem', { name: 'image' }));

    const tabs = await findVisSelectorTabs();
    expect(tabs).toHaveLength(1);
    expect(tabs[0]).toHaveTextContent(Vis.NxImage);
  });

  test('show "NX Image" tab for NXdata group with 2D signal', async () => {
    renderApp();

    fireEvent.click(
      await screen.findByRole('treeitem', { name: 'nexus_entry' })
    );
    fireEvent.click(screen.getByRole('treeitem', { name: 'nx_process' }));
    fireEvent.click(screen.getByRole('treeitem', { name: 'nx_data' }));

    const tabs = await findVisSelectorTabs();
    expect(tabs).toHaveLength(1);
    expect(tabs[0]).toHaveTextContent(Vis.NxImage);
  });

  test('show "NX Image" tab for NXentry group with 2D default signal', async () => {
    renderApp();

    fireEvent.click(
      await screen.findByRole('treeitem', { name: 'nexus_entry' })
    );

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

    // Select the 1D dataset nD_datasets/oneD
    fireEvent.click(
      await screen.findByRole('treeitem', { name: 'nD_datasets' })
    );
    const datasetBtn = screen.getByRole('treeitem', { name: 'oneD' });
    fireEvent.click(datasetBtn);

    const lineTab = await screen.findByRole('tab', { name: 'Line' });
    expect(lineTab).toBeVisible();
    expect(lineTab).toHaveAttribute('aria-selected', 'true');

    const matrixTab = screen.getByRole('tab', { name: 'Matrix' });
    expect(matrixTab).toBeVisible();
    expect(matrixTab).toHaveAttribute('aria-selected', 'false');

    // Switch to Matrix visualisation
    fireEvent.click(matrixTab);

    await waitFor(() => {
      expect(matrixTab).toHaveAttribute('aria-selected', 'true');
      expect(lineTab).toHaveAttribute('aria-selected', 'false');
    });
  });

  test("don't show visualization selector for basic group", async () => {
    renderApp();
    fireEvent.click(await screen.findByRole('treeitem', { name: 'entities' }));

    expect(await screen.findByText('Nothing to visualize')).toBeInTheDocument();
    expect(screen.queryByRole('tablist', { name: 'Visualization' })).toBeNull();
  });

  test("display error when dataset value can't be fetched", async () => {
    render(
      <MockProvider errorOnId="raw">
        <App />
      </MockProvider>
    );

    fireEvent.click(await screen.findByRole('treeitem', { name: 'entities' }));

    const { consoleError, resetConsole } = prepareForConsoleError();
    fireEvent.click(screen.getByRole('treeitem', { name: 'raw' }));

    expect(await screen.findByText('error')).toBeVisible();
    expect(consoleError).toHaveBeenCalledTimes(2); // React logs two stack traces
    resetConsole();

    fireEvent.click(screen.getByRole('treeitem', { name: 'scalar_str' }));
    expect(await screen.findByText(mockValues.scalar_str)).toBeVisible();
  });
});
