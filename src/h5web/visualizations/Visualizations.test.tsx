import { screen } from '@testing-library/react';
import { mockValues } from '../../packages/lib';
import {
  mockConsoleMethod,
  renderApp,
  selectExplorerNode,
} from '../test-utils';

describe('Visualizer', () => {
  test('visualise raw dataset', async () => {
    renderApp();
    await selectExplorerNode('entities/raw');

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

    await selectExplorerNode('scalar_str');
    expect(await screen.findByText('foo')).toBeVisible();
  });
});
