import { screen } from '@testing-library/react';

import { mockConsoleMethod, queryVisSelector, renderApp } from '../test-utils';

test('show fallback message when no visualization is supported', async () => {
  const { selectExplorerNode } = await renderApp();
  await selectExplorerNode('entities'); // simple group

  await expect(
    screen.findByText('No visualization available for this entity.')
  ).resolves.toBeInTheDocument();
  expect(queryVisSelector()).not.toBeInTheDocument();
});

test('show loader while fetching dataset value', async () => {
  jest.useFakeTimers('modern');
  const { selectExplorerNode } = await renderApp();

  await selectExplorerNode('resilience/slow_value');
  await expect(screen.findByText(/Loading data/)).resolves.toBeVisible();

  jest.runAllTimers(); // resolve slow fetch right away
  await expect(screen.findByText(/42/)).resolves.toBeVisible();

  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

test("show error when dataset value can't be fetched", async () => {
  const { selectExplorerNode } = await renderApp();

  const errorSpy = mockConsoleMethod('error');
  await selectExplorerNode('resilience/error_value');

  await expect(screen.findByText('error')).resolves.toBeVisible();
  expect(errorSpy).toHaveBeenCalledTimes(2); // React logs two stack traces
  errorSpy.mockRestore();

  // Make sure error boundary resets when selecting another entity
  await selectExplorerNode('entities');
  await expect(screen.findByText(/No visualization/)).resolves.toBeVisible();
});

test('cancel and retry slow fetch of dataset value', async () => {
  jest.useFakeTimers('modern');
  const { user, selectExplorerNode } = await renderApp();

  // Select dataset and start fetching value
  await selectExplorerNode('resilience/slow_value');
  await expect(screen.findByText(/Loading data/)).resolves.toBeVisible();

  // Cancel fetch
  const errorSpy = mockConsoleMethod('error');
  await user.click(await screen.findByRole('button', { name: /Cancel/ }));

  await expect(screen.findByText('Request cancelled')).resolves.toBeVisible();
  expect(errorSpy).toHaveBeenCalledTimes(2); // React logs two stack traces
  errorSpy.mockRestore();

  // Retry fetch
  await user.click(await screen.findByRole('button', { name: /Retry/ }));
  await expect(screen.findByText(/Loading data/)).resolves.toBeVisible();

  // Let fetch succeed
  jest.runAllTimers();
  await expect(screen.findByText(/42/)).resolves.toBeVisible();

  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

test('cancel and retry slow fetch of dataset slice', async () => {
  jest.useFakeTimers('modern');
  const { user, selectExplorerNode } = await renderApp();

  // Select dataset and start fetching first slice
  await selectExplorerNode('resilience/slow_slicing');
  await expect(
    screen.findByText(/Loading current slice/)
  ).resolves.toBeVisible();

  // Cancel fetch of first slice
  const errorSpy = mockConsoleMethod('error');
  await user.click(await screen.findByRole('button', { name: /Cancel/ }));

  await expect(screen.findByText('Request cancelled')).resolves.toBeVisible();
  expect(errorSpy).toHaveBeenCalledTimes(2); // React logs two stack traces
  errorSpy.mockRestore();

  // Retry fetch of first slice
  await user.click(await screen.findByRole('button', { name: /Retry/ }));
  await expect(
    screen.findByText(/Loading current slice/)
  ).resolves.toBeVisible();

  // Let fetch of first slice succeed
  jest.runAllTimers();
  await expect(screen.findByRole('figure')).resolves.toBeVisible();

  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

test('retry fetching automatically when re-selecting dataset', async () => {
  jest.useFakeTimers('modern');
  const { user, selectExplorerNode } = await renderApp();

  // Select dataset and start fetching
  await selectExplorerNode('resilience/slow_value');
  await expect(screen.findByText(/Loading data/)).resolves.toBeVisible();

  // Cancel fetch
  const errorSpy = mockConsoleMethod('error');
  await user.click(await screen.findByRole('button', { name: /Cancel/ }));
  await expect(screen.findByText('Request cancelled')).resolves.toBeVisible();
  errorSpy.mockRestore();

  // Switch to other entity with no visualization
  await selectExplorerNode('entities');
  await expect(screen.findByText(/No visualization/)).resolves.toBeVisible();

  // Select dataset again
  await selectExplorerNode('slow_value');
  await expect(screen.findByText(/Loading data/)).resolves.toBeVisible();

  // Let fetch succeed
  jest.runAllTimers();
  await expect(screen.findByText(/42/)).resolves.toBeVisible();

  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

test('retry fetching dataset slice automatically when re-selecting slice', async () => {
  jest.useFakeTimers('modern');
  const { user, selectExplorerNode } = await renderApp();

  // Select dataset and start fetching first slice
  await selectExplorerNode('resilience/slow_slicing');
  await expect(
    screen.findByText(/Loading current slice/)
  ).resolves.toBeVisible();

  // Cancel fetch of first slice
  const errorSpy = mockConsoleMethod('error');
  await user.click(await screen.findByRole('button', { name: /Cancel/ }));
  await expect(screen.findByText('Request cancelled')).resolves.toBeVisible();
  expect(errorSpy).toHaveBeenCalledTimes(2); // React logs two stack traces
  errorSpy.mockRestore();

  // Move to other slice and start fetching
  const d0Slider = screen.getByRole('slider', { name: 'Dimension slider' });
  d0Slider.focus();
  await user.keyboard('{ArrowUp}');
  await expect(
    screen.findByText(/Loading current slice/)
  ).resolves.toBeVisible();

  // Let fetch of other slice succeed
  jest.runAllTimers();
  await expect(screen.findByRole('figure')).resolves.toBeVisible();

  // Move back to first slice to retry fetching it automatically
  await user.keyboard('{ArrowDown}');
  await expect(
    screen.findByText(/Loading current slice/)
  ).resolves.toBeVisible();
  d0Slider.blur(); // remove focus to avoid state update after unmount

  // Let fetch of first slice succeed
  jest.runAllTimers();
  await expect(screen.findByRole('figure')).resolves.toBeVisible();

  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

test('cancel fetching dataset slice when changing entity', async () => {
  jest.useFakeTimers('modern');
  const { selectExplorerNode } = await renderApp();

  // Select dataset and start fetching first slice
  await selectExplorerNode('resilience/slow_slicing');
  await expect(
    screen.findByText(/Loading current slice/)
  ).resolves.toBeVisible();

  // Switch to another entity to cancel the fetch
  await selectExplorerNode('resilience/slow_value');
  await expect(screen.findByText(/Loading data/)).resolves.toBeVisible();

  // Let pending requests succeed
  jest.runAllTimers();

  // Reselect dataset and check that it refetches the first slice
  await selectExplorerNode('resilience/slow_slicing');
  // The slice request was cancelled so it should be pending once again
  await expect(
    screen.findByText(/Loading current slice/)
  ).resolves.toBeVisible();

  // Let fetch of first slice succeed
  jest.runAllTimers();
  await expect(screen.findByRole('figure')).resolves.toBeVisible();

  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

test('cancel fetching dataset slice when changing vis', async () => {
  jest.useFakeTimers('modern');
  const { user, selectExplorerNode } = await renderApp();

  // Select dataset and start fetching the slice
  await selectExplorerNode('resilience/slow_slicing');
  await expect(
    screen.findByText(/Loading current slice/)
  ).resolves.toBeVisible();

  // Switch to the Line vis to cancel the fetch
  await user.click(screen.getByRole('tab', { name: 'Line' }));
  await expect(
    screen.findByText(/Loading current slice/)
  ).resolves.toBeVisible();

  // Let pending requests succeed
  jest.runAllTimers();
  await expect(screen.findByRole('figure')).resolves.toBeVisible();

  // Switch back to Heatmap and check that it refetches the slice
  await user.click(screen.getByRole('tab', { name: 'Heatmap' }));
  // The slice request was cancelled so it should be pending once again
  await expect(
    screen.findByText(/Loading current slice/)
  ).resolves.toBeVisible();

  // Let fetch of the slice succeed
  jest.runAllTimers();
  await expect(screen.findByRole('figure')).resolves.toBeVisible();

  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});
