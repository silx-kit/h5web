import { mockValues } from '@h5web/shared';
import { screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  findVisSelectorTabs,
  mockConsoleMethod,
  renderApp,
  selectExplorerNode,
} from '../test-utils';
import { Vis } from '../vis-packs/core/visualizations';

test('visualise raw dataset', async () => {
  await renderApp();
  await selectExplorerNode('entities/raw');

  const tabs = await findVisSelectorTabs();
  expect(tabs).toHaveLength(1);
  expect(tabs[0]).toHaveTextContent(Vis.Raw);
  expect(tabs[0]).toHaveAttribute('aria-selected', 'true');

  expect(await screen.findByText(/"int": 42/)).toBeVisible();
});

test('log raw dataset to console if too large', async () => {
  await renderApp();

  const logSpy = mockConsoleMethod('log');
  await selectExplorerNode('entities/raw_large');

  expect(await screen.findByText(/dataset is too big/)).toBeVisible();
  expect(logSpy).toHaveBeenCalledWith(mockValues.raw_large);
});

test('visualise scalar dataset', async () => {
  await renderApp();

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
  await renderApp();
  await selectExplorerNode('nD_datasets/oneD');

  const tabs = await findVisSelectorTabs();
  expect(tabs).toHaveLength(2);
  expect(tabs[0]).toHaveTextContent(Vis.Matrix);
  expect(tabs[1]).toHaveTextContent(Vis.Line);
  expect(tabs[1]).toHaveAttribute('aria-selected', 'true');

  expect(await screen.findByRole('figure', { name: 'oneD' })).toBeVisible();
});

test('visualize 2D datasets', async () => {
  await renderApp();
  await selectExplorerNode('nD_datasets/twoD');

  const tabs = await findVisSelectorTabs();
  expect(tabs).toHaveLength(3);
  expect(tabs[0]).toHaveTextContent(Vis.Matrix);
  expect(tabs[1]).toHaveTextContent(Vis.Line);
  expect(tabs[2]).toHaveTextContent(Vis.Heatmap);
  expect(tabs[2]).toHaveAttribute('aria-selected', 'true');

  expect(await screen.findByRole('figure', { name: 'twoD' })).toBeVisible();
});

test('visualize 1D slice of a 3D dataset with and without autoscale', async () => {
  jest.useFakeTimers('modern');
  await renderApp();
  await selectExplorerNode('resilience/slow_slicing');

  // Heatmap is selected by default and fetches a 2D slice.
  expect(await screen.findByText(/Loading current slice/)).toBeVisible();

  // Let the 2D slice fetch succeed
  jest.runAllTimers();
  expect(await screen.findByRole('figure')).toBeVisible();

  // Select the LineVis. The autoscale is on by default: it should fetch a 1D slice.
  userEvent.click(await screen.findByRole('tab', { name: Vis.Line }));
  expect(await screen.findByText(/Loading current slice/)).toBeVisible();

  // Let the 1D slice fetch succeed
  jest.runAllTimers();
  expect(await screen.findByRole('figure')).toBeVisible();

  // Check that autoscale is truly on
  const autoScaleBtn = await screen.findByRole('button', {
    name: 'Auto-scale',
  });
  expect(autoScaleBtn).toHaveAttribute('aria-pressed', 'true');

  // Move to other slice to fetch new slice
  // eslint-disable-next-line prefer-destructuring
  const d0Slider = screen.getAllByRole('slider', {
    name: 'Dimension slider',
  })[0];
  d0Slider.focus();
  userEvent.keyboard('{ArrowUp}');
  expect(await screen.findByText(/Loading current slice/)).toBeVisible();

  // Let the new slice fetch succeed
  jest.runAllTimers();
  expect(await screen.findByRole('figure')).toBeVisible();

  // Activate autoscale. It should trigger the fetch of the entire dataset.
  userEvent.click(autoScaleBtn);
  expect(await screen.findByText(/Loading entire dataset/)).toBeVisible();

  // Let the dataset fetch succeed
  jest.runAllTimers();
  expect(await screen.findByRole('figure')).toBeVisible();

  // Check that entire dataset is fetched
  d0Slider.focus();
  act(() => {
    userEvent.keyboard('{ArrowUp}');
    jest.advanceTimersByTime(100); // account for debouncing of `dimMapping` state
  });
  expect(await screen.findByRole('figure')).toBeVisible();
  d0Slider.blur(); // remove focus to avoid state update after unmount

  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});
