import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderApp, selectExplorerNode, selectVisTab } from '../test-utils';
import { Vis } from '../vis-packs/core/visualizations';

test('display mapping for X axis when visualizing 2D dataset as Line', async () => {
  jest.useFakeTimers('modern');
  await renderApp();
  await selectExplorerNode('nD_datasets/twoD');
  await selectVisTab(Vis.Line);

  // Ensure that the dimension mapper is only visible for X (and not for Y)
  const xRadioGroup = screen.getByLabelText('Dimension as x axis');
  const yRadioGroup = screen.queryByLabelText('Dimension as y axis');
  expect(xRadioGroup).toBeVisible();
  expect(yRadioGroup).not.toBeInTheDocument();

  // Ensure that the default mapping is [0, 'x']
  const xDimsButtons = within(xRadioGroup).getAllByRole('radio');
  expect(xDimsButtons).toHaveLength(2);
  expect(xDimsButtons[0]).not.toBeChecked();
  expect(xDimsButtons[1]).toBeChecked();

  const d0Slider = screen.getByRole('slider');
  expect(d0Slider).toHaveAttribute('aria-valueNow', '0');

  act(() => {
    // Ensure that the swap from [0, 'x'] to ['x', 0] works
    userEvent.click(xDimsButtons[0]);
    jest.advanceTimersByTime(100); // account for debouncing of `dimMapping` state
  });

  expect(xDimsButtons[0]).toBeChecked();
  expect(xDimsButtons[1]).not.toBeChecked();

  const d1Slider = screen.getByRole('slider');
  expect(d1Slider).toHaveAttribute('aria-valueNow', '0');

  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

test('display mappings for X and Y axes when visualizing 2D dataset as Heatmap', async () => {
  jest.useFakeTimers('modern');
  await renderApp();
  await selectExplorerNode('nD_datasets/twoD');
  await selectVisTab(Vis.Heatmap);

  // Ensure that the dimension mapper is visible for X and Y
  const xRadioGroup = screen.getByLabelText('Dimension as x axis');
  const yRadioGroup = screen.getByLabelText('Dimension as y axis');
  expect(xRadioGroup).toBeVisible();
  expect(yRadioGroup).toBeVisible();

  const xD0Button = within(xRadioGroup).getByRole('radio', { name: 'D0' });
  const xD1Button = within(xRadioGroup).getByRole('radio', { name: 'D1' });
  const yD0Button = within(yRadioGroup).getByRole('radio', { name: 'D0' });
  const yD1Button = within(yRadioGroup).getByRole('radio', { name: 'D1' });

  // Ensure that the default mapping is ['y', 'x']
  expect(xD1Button).toBeChecked();
  expect(yD0Button).toBeChecked();

  act(() => {
    // Ensure that the swap from ['y', 'x'] to ['x', 'y'] works
    userEvent.click(xD0Button);
    jest.advanceTimersByTime(100); // account for debouncing of `dimMapping` state
  });

  expect(xD0Button).toBeChecked();
  expect(xD1Button).not.toBeChecked();
  expect(yD0Button).not.toBeChecked();
  expect(yD1Button).toBeChecked();

  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

test('display one dimension slider and mappings for X and Y axes when visualizing 3D dataset as Matrix', async () => {
  await renderApp();
  await selectExplorerNode('nD_datasets/threeD');
  await selectVisTab(Vis.Matrix);

  // Ensure that the dimension mapper is visible for X and Y
  const xRadioGroup = await screen.findByLabelText('Dimension as x axis');
  expect(xRadioGroup).toBeVisible();
  const xDimsButtons = within(xRadioGroup).getAllByRole('radio');
  expect(xDimsButtons).toHaveLength(3);

  const yRadioGroup = screen.getByLabelText('Dimension as y axis');
  expect(yRadioGroup).toBeVisible();
  const yDimsButtons = within(yRadioGroup).getAllByRole('radio');
  expect(yDimsButtons).toHaveLength(3);

  // Ensure that the default mapping is [0, 'y', 'x']
  expect(xDimsButtons[2]).toBeChecked();
  expect(yDimsButtons[1]).toBeChecked();
  const d0Slider = screen.getByRole('slider');
  expect(d0Slider).toHaveAttribute('aria-valueNow', '0');
});
