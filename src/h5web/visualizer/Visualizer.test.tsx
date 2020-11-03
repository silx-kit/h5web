import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { mockValues } from '../../packages/lib';
import App from '../App';
import { prepareForConsoleError, renderApp } from '../test-utils';
import { MockProvider } from '../../packages/app';

describe('Visualizer', () => {
  test('visualise scalar dataset', async () => {
    renderApp();

    fireEvent.click(await screen.findByRole('treeitem', { name: 'entities' }));
    const datasetBtn = screen.getByRole('treeitem', { name: 'scalar_int' });
    expect(datasetBtn).toBeVisible();

    fireEvent.click(datasetBtn);
    expect(datasetBtn).toHaveAttribute('aria-selected', 'true');
    expect(datasetBtn).not.toHaveAttribute('aria-expanded'); // a dataset cannot be expanded

    const scalarTab = await screen.findByRole('tab', { name: 'Scalar' });
    expect(scalarTab).toBeVisible();
    expect(scalarTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('0')).toBeVisible();

    fireEvent.click(screen.getByRole('treeitem', { name: 'scalar_str' }));
    expect(await screen.findByText('foo')).toBeVisible();
  });

  test('switch visualisations', async () => {
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
