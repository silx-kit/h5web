import { screen } from '@testing-library/react';

import { mockConsoleMethod, renderApp } from '../test-utils';
import { Vis } from '../vis-packs/core/visualizations';

test('show fallback message when no visualization is supported', async () => {
  await renderApp('/entities'); // simple group
  expect(screen.getByText(/No visualization available/)).toBeVisible();
});

test('show loader while fetching dataset value', async () => {
  await renderApp({
    initialPath: '/resilience/slow_value',
    withFakeTimers: true,
  });

  await expect(screen.findByText(/Loading data/)).resolves.toBeVisible();

  jest.runAllTimers(); // resolve slow fetch right away
  await expect(screen.findByText(/42/)).resolves.toBeVisible();
});

test("show error when dataset value can't be fetched", async () => {
  const errorSpy = mockConsoleMethod('error');
  const { selectExplorerNode } = await renderApp('/resilience/error_value');

  await expect(screen.findByText('error')).resolves.toBeVisible();
  expect(errorSpy).toHaveBeenCalledTimes(2); // React logs two stack traces
  errorSpy.mockRestore();

  // Make sure error boundary resets when selecting another entity
  await selectExplorerNode('entities');
  await expect(screen.findByText(/No visualization/)).resolves.toBeVisible();
});

test('cancel and retry slow fetch of dataset value', async () => {
  const { user } = await renderApp({
    initialPath: '/resilience/slow_value',
    withFakeTimers: true,
  });

  // Select dataset and start fetching value
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
});

test('cancel and retry slow fetch of dataset slice', async () => {
  const { user } = await renderApp({
    initialPath: '/resilience/slow_slicing',
    withFakeTimers: true,
  });

  // Select dataset and start fetching first slice
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
});

test('retry fetching automatically when re-selecting dataset', async () => {
  const { user, selectExplorerNode } = await renderApp({
    initialPath: '/resilience/slow_value',
    withFakeTimers: true,
  });

  // Select dataset and start fetching
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
});

test('retry fetching dataset slice automatically when re-selecting slice', async () => {
  const { user } = await renderApp({
    initialPath: '/resilience/slow_slicing',
    withFakeTimers: true,
  });

  // Select dataset and start fetching first slice
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
  const d0Slider = screen.getByRole('slider', { name: 'D0' });
  await user.type(d0Slider, '{ArrowUp}');
  await expect(
    screen.findByText(/Loading current slice/)
  ).resolves.toBeVisible();

  // Let fetch of other slice succeed
  jest.runAllTimers();
  await expect(screen.findByRole('figure')).resolves.toBeVisible();

  // Move back to first slice to retry fetching it automatically
  await user.type(d0Slider, '{ArrowDown}');
  await expect(
    screen.findByText(/Loading current slice/)
  ).resolves.toBeVisible();
  d0Slider.blur(); // remove focus to avoid state update after unmount

  // Let fetch of first slice succeed
  jest.runAllTimers();
  await expect(screen.findByRole('figure')).resolves.toBeVisible();
});

test('cancel fetching dataset slice when changing entity', async () => {
  const { selectExplorerNode } = await renderApp({
    initialPath: '/resilience/slow_slicing',
    withFakeTimers: true,
  });

  // Select dataset and start fetching first slice
  await expect(
    screen.findByText(/Loading current slice/)
  ).resolves.toBeVisible();

  // Switch to another entity to cancel the fetch
  await selectExplorerNode('slow_value');
  await expect(screen.findByText(/Loading data/)).resolves.toBeVisible();

  // Let pending requests succeed
  jest.runAllTimers();

  // Reselect dataset and check that it refetches the first slice
  await selectExplorerNode('slow_slicing');
  // The slice request was cancelled so it should be pending once again
  await expect(
    screen.findByText(/Loading current slice/)
  ).resolves.toBeVisible();

  // Let fetch of first slice succeed
  jest.runAllTimers();
  await expect(screen.findByRole('figure')).resolves.toBeVisible();
});

test('cancel fetching dataset slice when changing vis', async () => {
  const { selectVisTab } = await renderApp({
    initialPath: '/resilience/slow_slicing',
    withFakeTimers: true,
  });

  // Select dataset and start fetching the slice
  await expect(
    screen.findByText(/Loading current slice/)
  ).resolves.toBeVisible();

  // Switch to the Line vis to cancel the fetch
  await selectVisTab(Vis.Line);
  await expect(
    screen.findByText(/Loading current slice/)
  ).resolves.toBeVisible();

  // Let pending requests succeed
  jest.runAllTimers();
  await expect(screen.findByRole('figure')).resolves.toBeVisible();

  // Switch back to Heatmap visualization
  await selectVisTab(Vis.Heatmap);

  // Ensure that fetching restarts (since it was cancelled)
  await expect(
    screen.findByText(/Loading current slice/)
  ).resolves.toBeVisible();

  // Let fetch of slice succeed
  jest.runAllTimers();
  await expect(screen.findByRole('figure')).resolves.toBeVisible();
});
