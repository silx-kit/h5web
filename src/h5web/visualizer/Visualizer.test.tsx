import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockValues } from '../providers/mock/values';
import {
  mockConsoleMethod,
  queryVisSelector,
  renderApp,
  selectExplorerNode,
} from '../test-utils';

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
  userEvent.click(matrixTab);

  expect(screen.getByRole('tab', { name: 'Matrix' })).toHaveAttribute(
    'aria-selected',
    'true'
  );
  expect(screen.getByRole('tab', { name: 'Line' })).toHaveAttribute(
    'aria-selected',
    'false'
  );
});

test('show fallback message when no visualization is supported', async () => {
  renderApp();
  await selectExplorerNode('entities'); // simple group

  expect(
    await screen.findByText('No visualization available for this entity.')
  ).toBeInTheDocument();
  expect(queryVisSelector()).not.toBeInTheDocument();
});

test('show loader while fetching dataset value', async () => {
  renderApp();

  jest.useFakeTimers();
  await selectExplorerNode('resilience/slow_value');
  expect(await screen.findByText(/Loading data/)).toBeVisible();

  jest.runAllTimers(); // resolve slow fetch right away
  expect(await screen.findByText(/42/)).toBeVisible();

  jest.useRealTimers();
});

test("show error when dataset value can't be fetched and reset when selecting another dataset", async () => {
  renderApp();

  const errorSpy = mockConsoleMethod('error');
  await selectExplorerNode('resilience/error_value');

  expect(await screen.findByText('error')).toBeVisible();
  expect(errorSpy).toHaveBeenCalledTimes(2); // React logs two stack traces
  errorSpy.mockRestore();

  await selectExplorerNode('entities/scalar_str');
  expect(await screen.findByText(mockValues.scalar_str)).toBeVisible();
});

test('cancel and retry slow fetch of dataset value', async () => {
  renderApp();

  const errorSpy = mockConsoleMethod('error');
  await selectExplorerNode('resilience/slow_value');
  expect(await screen.findByText(/Loading data/)).toBeVisible();

  userEvent.click(await screen.findByRole('button', { name: /Cancel/ }));

  expect(await screen.findByText('Request cancelled')).toBeVisible();
  expect(errorSpy).toHaveBeenCalledTimes(2); // React logs two stack traces
  errorSpy.mockRestore();

  jest.useFakeTimers();
  userEvent.click(await screen.findByRole('button', { name: /Retry/ }));
  expect(await screen.findByText(/Loading data/)).toBeVisible();

  jest.runAllTimers(); // resolve slow fetch right away
  expect(await screen.findByText(/42/)).toBeVisible();

  jest.useRealTimers();
});

test('cancel and retry slow fetch of dataset slice', async () => {
  renderApp();

  jest.useFakeTimers();
  const errorSpy = mockConsoleMethod('error');

  await selectExplorerNode('resilience/slow_slicing');
  expect(await screen.findByText(/Loading data/)).toBeVisible();

  // Cancel fetch of first slice
  userEvent.click(await screen.findByRole('button', { name: /Cancel/ }));
  expect(await screen.findByText('Request cancelled')).toBeVisible();
  expect(errorSpy).toHaveBeenCalledTimes(2); // React logs two stack traces

  // Move to second slice
  const d0Slider = screen.getByRole('slider');
  d0Slider.focus();
  userEvent.keyboard('{ArrowUp}');
  expect(await screen.findByText(/Loading data/)).toBeVisible();

  // Let fetch of second slice succeed
  jest.runAllTimers();
  expect(await screen.findByRole('figure')).toBeVisible();

  // Move back to first slice and retry fetch
  userEvent.keyboard('{ArrowDown}');
  userEvent.click(await screen.findByRole('button', { name: /Retry/ }));
  expect(await screen.findByText(/Loading data/)).toBeVisible();

  // Let fetch of first slice succeed
  jest.runAllTimers();
  expect(await screen.findByRole('figure')).toBeVisible();

  errorSpy.mockRestore();
  jest.useRealTimers();
});
