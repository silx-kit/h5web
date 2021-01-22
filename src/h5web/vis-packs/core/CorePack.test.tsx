import { screen } from '@testing-library/react';
import { mockValues } from '../../providers/mock/values';
import {
  findVisSelectorTabs,
  mockConsoleMethod,
  renderApp,
  selectExplorerNode,
} from '../../test-utils';
import { Vis } from './visualizations';

describe('CorePack', () => {
  test('visualise raw dataset', async () => {
    renderApp();
    await selectExplorerNode('entities/raw');

    const tabs = await findVisSelectorTabs();
    expect(tabs).toHaveLength(1);
    expect(tabs[0]).toHaveTextContent(Vis.Raw);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');

    expect(await screen.findByText(/"int": 42/u)).toBeVisible();
  });

  test('log raw dataset to console if too large', async () => {
    const { consoleMock, resetConsole } = mockConsoleMethod('log');

    renderApp();
    await selectExplorerNode('entities/raw_large');

    expect(await screen.findByText(/dataset is too big/u)).toBeVisible();
    expect(consoleMock).toHaveBeenCalledWith(mockValues.raw_large);

    resetConsole();
  });

  test('visualise scalar dataset', async () => {
    renderApp();

    await selectExplorerNode('entities/scalar_int');
    expect(await screen.findByText('0')).toBeVisible();

    const tabs = await findVisSelectorTabs();
    expect(tabs).toHaveLength(1);
    expect(tabs[0]).toHaveTextContent(Vis.Scalar);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');

    await selectExplorerNode('scalar_str');
    expect(await screen.findByText(mockValues.scalar_str)).toBeVisible();
  });

  test('visualize 1D dataset', async () => {
    renderApp();
    await selectExplorerNode('nD_datasets/oneD');

    const tabs = await findVisSelectorTabs();
    expect(tabs).toHaveLength(2);
    expect(tabs[0]).toHaveTextContent(Vis.Matrix);
    expect(tabs[1]).toHaveTextContent(Vis.Line);
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
  });

  test('visualize 2D datasets', async () => {
    renderApp();
    await selectExplorerNode('nD_datasets/twoD');

    const tabs = await findVisSelectorTabs();
    expect(tabs).toHaveLength(3);
    expect(tabs[0]).toHaveTextContent(Vis.Matrix);
    expect(tabs[1]).toHaveTextContent(Vis.Line);
    expect(tabs[2]).toHaveTextContent(Vis.Heatmap);
    expect(tabs[2]).toHaveAttribute('aria-selected', 'true');
  });
});
