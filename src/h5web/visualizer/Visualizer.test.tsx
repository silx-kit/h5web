import { fireEvent, render, screen } from '@testing-library/react';
import App from '../App';
import MockProvider from '../providers/mock/MockProvider';
import { mockValues } from '../providers/mock/values';
import {
  mockConsoleMethod,
  queryVisSelector,
  renderApp,
  selectExplorerNode,
} from '../test-utils';

describe('Visualizer', () => {
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

  test("show error when dataset value can't be fetched and reset when selecting another dataset", async () => {
    render(
      <MockProvider errorOnPath="/entities/raw">
        <App />
      </MockProvider>
    );

    const errorSpy = mockConsoleMethod('error');
    await selectExplorerNode('entities/raw');

    expect(await screen.findByText('error')).toBeVisible();
    expect(errorSpy).toHaveBeenCalledTimes(2); // React logs two stack traces
    errorSpy.mockRestore();

    await selectExplorerNode('scalar_str');
    expect(await screen.findByText(mockValues.scalar_str)).toBeVisible();
  });
});
