import { screen } from '@testing-library/react';
import { renderApp, selectExplorerNode } from '../test-utils';

describe('Visualizer', () => {
  test('visualise raw dataset', async () => {
    renderApp();
    await selectExplorerNode('entities/raw');

    expect(await screen.findByText(/"int": 42/u)).toBeVisible();
  });

  test('visualise scalar dataset', async () => {
    renderApp();

    await selectExplorerNode('entities/scalar_int');
    expect(await screen.findByText('0')).toBeVisible();

    await selectExplorerNode('scalar_str');
    expect(await screen.findByText('foo')).toBeVisible();
  });
});
