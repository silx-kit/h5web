import { expect, test } from 'vitest';
import { page } from 'vitest/browser';

import { mockConsoleMethod, mockDelay, renderApp } from '../test-utils';
import { Vis } from '../vis-packs/core/visualizations';

test('visualize default dataset', async () => {
  const { selectExplorerNode } = await renderApp('/entities');
  await selectExplorerNode('group_default_dataset');
  expect(page.getByText('foo')).toBeVisible();
});

test('show fallback message when no visualization is supported', async () => {
  await renderApp('/entities'); // simple group
  expect(page.getByText('Nothing to display')).toBeVisible();
});

test('show loader while fetching dataset value', async () => {
  const runAll = mockDelay();
  await renderApp({
    initialPath: '/resilience/slow_value',
    waitForLoaders: false,
  });

  await expect.element(page.getByText('Loading data...')).toBeVisible();

  runAll();
  await expect.element(page.getByText('42')).toBeVisible();
});

test("show error when dataset value can't be fetched", async () => {
  const runAll = mockDelay();
  const errorSpy = mockConsoleMethod('error');

  const { selectExplorerNode } = await renderApp({
    initialPath: '/resilience/error_value',
    waitForLoaders: false,
  });
  runAll();

  expect(page.getByText('error', { exact: true })).toBeVisible();
  errorSpy.mockRestore();

  // Make sure error boundary resets when selecting another entity
  await selectExplorerNode('entities');
  expect(page.getByText('Nothing to display')).toBeVisible();
});

test('cancel and retry slow fetch of dataset value', async () => {
  const runAll = mockDelay();
  const { user } = await renderApp({
    initialPath: '/resilience/slow_value',
    waitForLoaders: false,
  });

  await expect.element(page.getByText('Loading data...')).toBeVisible();

  // Cancel fetch
  const errorSpy = mockConsoleMethod('error');
  await user.click(page.getByRole('button', { name: 'Cancel?' }));
  await expect.element(page.getByText('Request cancelled')).toBeVisible();
  // expect(errorSpy).toHaveBeenCalledTimes(3); // React logs two stack traces + one extra for some reason
  errorSpy.mockRestore();

  // Retry fetch
  await user.click(page.getByRole('button', { name: /Retry/ }));
  await expect.element(page.getByText('Loading data...')).toBeVisible();

  // Let fetch succeed
  runAll();
  await expect.element(page.getByText('42')).toBeVisible();
});

test('cancel and retry slow fetch of dataset slice', async () => {
  const runAll = mockDelay();
  await renderApp({
    initialPath: '/resilience/slow_slicing',
    waitForLoaders: false,
  });

  await expect
    .element(page.getByText('Loading current slice...'))
    .toBeVisible();

  // Cancel fetch of first slice
  const errorSpy = mockConsoleMethod('error');
  await page.getByRole('button', { name: 'Cancel?' }).click();
  await expect.element(page.getByText('Request cancelled')).toBeVisible();
  errorSpy.mockRestore();

  // Retry fetch of first slice
  await page.getByRole('button', { name: 'Retry?' }).click();
  await expect
    .element(page.getByText('Loading current slice...'))
    .toBeVisible();

  // Let fetch of first slice succeed
  runAll();
  await expect.element(page.getByRole('figure')).toBeVisible();
});

test('retry fetching automatically when re-selecting dataset', async () => {
  const runAll = mockDelay();
  const { selectExplorerNode } = await renderApp({
    initialPath: '/resilience/slow_value',
    waitForLoaders: false,
  });

  await expect.element(page.getByText('Loading data...')).toBeVisible();

  // Cancel fetch
  const errorSpy = mockConsoleMethod('error');
  await page.getByRole('button', { name: 'Cancel?' }).click();
  await expect.element(page.getByText('Request cancelled')).toBeVisible();
  errorSpy.mockRestore();

  // Switch to other entity with no visualization
  await selectExplorerNode('entities');
  await expect.element(page.getByText('Nothing to display')).toBeVisible();

  // Select dataset again
  await selectExplorerNode('slow_value');
  await expect.element(page.getByText('Loading data...')).toBeVisible();

  // Let fetch succeed
  runAll();
  await expect.element(page.getByText('42')).toBeVisible();
});

test('retry fetching dataset slice automatically when re-selecting slice', async () => {
  const runAll = mockDelay();
  const { user } = await renderApp({
    initialPath: '/resilience/slow_slicing',
    waitForLoaders: false,
  });

  await expect
    .element(page.getByText('Loading current slice...'))
    .toBeVisible();

  // Cancel fetch of first slice
  const errorSpy = mockConsoleMethod('error');
  await page.getByRole('button', { name: 'Cancel?' }).click();
  await expect.element(page.getByText('Request cancelled')).toBeVisible();
  errorSpy.mockRestore();

  // Move to other slice and start fetching
  const d0Slider = page.getByRole('slider', { name: 'D0' });
  await user.type(d0Slider, '{ArrowUp}');

  await expect
    .element(page.getByText('Loading current slice...'))
    .toBeVisible();

  // Let fetch of other slice succeed
  runAll();
  await expect.element(page.getByRole('figure')).toBeVisible();

  // Move back to first slice to retry fetching it automatically
  await user.type(d0Slider, '{ArrowDown}');

  await expect
    .element(page.getByText('Loading current slice...'))
    .toBeVisible();

  // Let fetch of first slice succeed
  runAll();
  await expect.element(page.getByRole('figure')).toBeVisible();
});

test('cancel fetching dataset slice when changing entity', async () => {
  const runAll = mockDelay();
  const { selectExplorerNode } = await renderApp({
    initialPath: '/resilience/slow_slicing',
    waitForLoaders: false,
  });

  await expect
    .element(page.getByText('Loading current slice...'))
    .toBeVisible();

  // Switch to another entity to cancel the fetch
  const errorSpy = mockConsoleMethod('error'); // `act` warning due to previous slice getting cancelled
  await selectExplorerNode('slow_value');
  await expect.element(page.getByText('Loading data...')).toBeVisible();
  errorSpy.mockRestore();

  // Let fetch succeed
  runAll();
  await expect.element(page.getByText('42')).toBeVisible();

  // Reselect initial dataset
  await selectExplorerNode('slow_slicing');

  // Ensure that fetching restarts (since it was cancelled)
  await expect
    .element(page.getByText('Loading current slice...'))
    .toBeVisible();

  // Let fetch of first slice succeed
  runAll();
  await expect.element(page.getByRole('figure')).toBeVisible();
});

test('cancel fetching dataset slice when changing vis', async () => {
  const runAll = mockDelay();
  const { selectVisTab } = await renderApp({
    initialPath: '/resilience/slow_slicing',
    waitForLoaders: false,
  });

  await expect
    .element(page.getByText('Loading current slice...'))
    .toBeVisible();

  // Switch to Line visualization to cancel fetch
  const errorSpy = mockConsoleMethod('error'); // `act` warning due to previous slice getting cancelled
  await selectVisTab(Vis.Line);
  await expect
    .element(page.getByText('Loading current slice...'))
    .toBeVisible();
  errorSpy.mockRestore();

  // Let pending requests succeed
  runAll();
  await expect.element(page.getByRole('figure')).toBeVisible();

  // Switch back to Heatmap visualization
  await selectVisTab(Vis.Heatmap);

  // Ensure that fetching restarts (since it was cancelled)
  await expect
    .element(page.getByText('Loading current slice...'))
    .toBeVisible();

  // Let fetch of slice succeed
  runAll();
  await expect.element(page.getByRole('figure')).toBeVisible();
});
