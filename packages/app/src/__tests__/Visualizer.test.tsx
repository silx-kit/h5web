import { expect, test } from 'vitest';
import { page } from 'vitest/browser';

// import { SLOW_TIMEOUT } from '../providers/mock/utils';
import { mockConsoleMethod, renderApp } from '../test-utils';
// import { Vis } from '../vis-packs/core/visualizations';

test('show fallback message when no visualization is supported', async () => {
  await renderApp('/entities'); // simple group
  expect(page.getByText('Nothing to display')).toBeVisible();
});

// eslint-disable-next-line vitest/no-commented-out-tests
// test('show loader while fetching dataset value', async () => {
//   await renderApp({
//     initialPath: '/resilience/slow_value',
//     withFakeTimers: true,
//   });

//   await expect(page.findByText(/Loading data/)).resolves.toBeVisible();
//   await expect(
//     page.findByText(/42/, undefined, { timeout: SLOW_TIMEOUT }),
//   ).resolves.toBeVisible();
// });

test("show error when dataset value can't be fetched", async () => {
  const errorSpy = mockConsoleMethod('error');
  const { selectExplorerNode } = await renderApp('/resilience/error_value');

  expect(page.getByText('error', { exact: true })).toBeVisible();
  errorSpy.mockRestore();

  // Make sure error boundary resets when selecting another entity
  await selectExplorerNode('entities');
  expect(page.getByText('Nothing to display')).toBeVisible();
});

// eslint-disable-next-line vitest/no-commented-out-tests
// test('cancel and retry slow fetch of dataset value', async () => {
//   const { user } = await renderApp({
//     initialPath: '/resilience/slow_value',
//     withFakeTimers: true,
//   });

//   await expect(page.findByText(/Loading data/)).resolves.toBeVisible();

//   // Cancel fetch
//   const errorSpy = mockConsoleMethod('error');
//   await user.click(page.getByRole('button', { name: /Cancel/ }));
//   await expect(page.findByText('Request cancelled')).resolves.toBeVisible();
//   // expect(errorSpy).toHaveBeenCalledTimes(3); // React logs two stack traces + one extra for some reason
//   errorSpy.mockRestore();

//   // Retry fetch
//   await user.click(page.getByRole('button', { name: /Retry/ }));
//   await expect(page.findByText(/Loading data/)).resolves.toBeVisible();

//   // Let fetch succeed
//   await expect(
//     page.findByText(/42/, undefined, { timeout: SLOW_TIMEOUT }),
//   ).resolves.toBeVisible();
// });

// eslint-disable-next-line vitest/no-commented-out-tests
// test('cancel and retry slow fetch of dataset slice', async () => {
//   const { user } = await renderApp({
//     initialPath: '/resilience/slow_slicing',
//     withFakeTimers: true,
//   });

//   await expect(page.findByText(/Loading current slice/)).resolves.toBeVisible();

//   // Cancel fetch of first slice
//   const errorSpy = mockConsoleMethod('error');
//   await user.click(page.getByRole('button', { name: /Cancel/ }));
//   await expect(page.findByText('Request cancelled')).resolves.toBeVisible();
//   errorSpy.mockRestore();

//   // Retry fetch of first slice
//   await user.click(page.getByRole('button', { name: /Retry/ }));
//   await expect(page.findByText(/Loading current slice/)).resolves.toBeVisible();

//   // Let fetch of first slice succeed
//   await expect(
//     page.findByRole('figure', undefined, { timeout: SLOW_TIMEOUT }),
//   ).resolves.toBeVisible();
// });

// eslint-disable-next-line vitest/no-commented-out-tests
// test('retry fetching automatically when re-selecting dataset', async () => {
//   const { user, selectExplorerNode } = await renderApp({
//     initialPath: '/resilience/slow_value',
//     withFakeTimers: true,
//   });

//   await expect(page.findByText(/Loading data/)).resolves.toBeVisible();

//   // Cancel fetch
//   const errorSpy = mockConsoleMethod('error');
//   await user.click(page.getByRole('button', { name: /Cancel/ }));
//   await expect(page.findByText('Request cancelled')).resolves.toBeVisible();
//   errorSpy.mockRestore();

//   // Switch to other entity with no visualization
//   await selectExplorerNode('entities');
//   await expect(page.findByText(/Nothing to display/)).resolves.toBeVisible();

//   // Select dataset again
//   await selectExplorerNode('slow_value');
//   await expect(page.findByText(/Loading data/)).resolves.toBeVisible();

//   // Let fetch succeed
//   await expect(
//     page.findByText(/42/, undefined, { timeout: SLOW_TIMEOUT }),
//   ).resolves.toBeVisible();
// });

// eslint-disable-next-line vitest/no-commented-out-tests
// test('retry fetching dataset slice automatically when re-selecting slice', async () => {
//   const { user } = await renderApp({
//     initialPath: '/resilience/slow_slicing',
//     withFakeTimers: true,
//   });

//   await expect(page.findByText(/Loading current slice/)).resolves.toBeVisible();

//   // Cancel fetch of first slice
//   const errorSpy = mockConsoleMethod('error');
//   await user.click(page.getByRole('button', { name: /Cancel/ }));
//   await expect(page.findByText('Request cancelled')).resolves.toBeVisible();
//   errorSpy.mockRestore();

//   // Move to other slice and start fetching
//   const d0Slider = page.getByRole('slider', { name: 'D0' });
//   await user.type(d0Slider, '{ArrowUp}');

//   await expect(page.findByText(/Loading current slice/)).resolves.toBeVisible();

//   // Let fetch of other slice succeed
//   await expect(
//     page.findByRole('figure', undefined, { timeout: SLOW_TIMEOUT }),
//   ).resolves.toBeVisible();

//   // Move back to first slice to retry fetching it automatically
//   await user.type(d0Slider, '{ArrowDown}');

//   await expect(page.findByText(/Loading current slice/)).resolves.toBeVisible();

//   // Let fetch of first slice succeed
//   await expect(
//     page.findByRole('figure', undefined, { timeout: SLOW_TIMEOUT }),
//   ).resolves.toBeVisible();
// });

// eslint-disable-next-line vitest/no-commented-out-tests
// test('cancel fetching dataset slice when changing entity', async () => {
//   const { selectExplorerNode } = await renderApp({
//     initialPath: '/resilience/slow_slicing',
//     withFakeTimers: true,
//   });

//   await expect(page.findByText(/Loading current slice/)).resolves.toBeVisible();

//   // Switch to another entity to cancel the fetch
//   const errorSpy = mockConsoleMethod('error'); // `act` warning due to previous slice getting cancelled
//   await selectExplorerNode('slow_value');
//   await expect(page.findByText(/Loading data/)).resolves.toBeVisible();
//   errorSpy.mockRestore();

//   // Let fetch succeed
//   await expect(
//     page.findByText(/42/, undefined, { timeout: SLOW_TIMEOUT }),
//   ).resolves.toBeVisible();

//   // Reselect initial dataset
//   await selectExplorerNode('slow_slicing');

//   // Ensure that fetching restarts (since it was cancelled)
//   await expect(page.findByText(/Loading current slice/)).resolves.toBeVisible();

//   // Let fetch of first slice succeed
//   await expect(
//     page.findByRole('figure', undefined, { timeout: SLOW_TIMEOUT }),
//   ).resolves.toBeVisible();
// });

// eslint-disable-next-line vitest/no-commented-out-tests
// test('cancel fetching dataset slice when changing vis', async () => {
//   const { selectVisTab } = await renderApp({
//     initialPath: '/resilience/slow_slicing',
//     withFakeTimers: true,
//   });

//   await expect(page.findByText(/Loading current slice/)).resolves.toBeVisible();

//   // Switch to Line visualization to cancel fetch
//   const errorSpy = mockConsoleMethod('error'); // `act` warning due to previous slice getting cancelled
//   await selectVisTab(Vis.Line);
//   await expect(page.findByText(/Loading current slice/)).resolves.toBeVisible();
//   errorSpy.mockRestore();

//   // Let pending requests succeed
//   await expect(
//     page.findByRole('figure', undefined, { timeout: SLOW_TIMEOUT }),
//   ).resolves.toBeVisible();

//   // Switch back to Heatmap visualization
//   await selectVisTab(Vis.Heatmap);

//   // Ensure that fetching restarts (since it was cancelled)
//   await expect(page.findByText(/Loading current slice/)).resolves.toBeVisible();

//   // Let fetch of slice succeed
//   await expect(
//     page.findByRole('figure', undefined, { timeout: SLOW_TIMEOUT }),
//   ).resolves.toBeVisible();
// });
