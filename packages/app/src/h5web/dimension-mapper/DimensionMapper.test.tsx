import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp, selectExplorerNode, selectVisTab } from '../test-utils';
import { Vis } from '../vis-packs/core/visualizations';

test('display mapping for X axis when visualizing 2D dataset as Line', async () => {
  await renderApp();
  await selectExplorerNode('nD_datasets/twoD');
  await selectVisTab(Vis.Line);

  // Ensure that the dimension mapper is only visible for X (and not for Y)
  const xRadioGroup = screen.getByLabelText('Dimension as x axis');
  expect(xRadioGroup).toBeVisible();
  const xDimsButtons = within(xRadioGroup).getAllByRole('radio');
  expect(xDimsButtons).toHaveLength(2);
  const yRadioGroup = screen.queryByLabelText('Dimension as y axis');
  expect(yRadioGroup).not.toBeInTheDocument();

  // Ensure that the default mapping is [0, 'x']
  expect(xDimsButtons[0]).not.toBeChecked();
  expect(xDimsButtons[1]).toBeChecked();
  const d0Slider = screen.getByRole('slider');
  expect(d0Slider).toHaveAttribute('aria-valueNow', '0');

  // Ensure that the swap from [0, 'x'] to ['x', 0] works
  userEvent.click(xDimsButtons[0]);

  expect(xDimsButtons[0]).toBeChecked();
  expect(xDimsButtons[1]).not.toBeChecked();
  const d1Slider = screen.getByRole('slider');
  expect(d1Slider).toHaveAttribute('aria-valueNow', '0');
});

test('display mappings for X and Y axes when visualizing 2D dataset as Heatmap', async () => {
  await renderApp();
  await selectExplorerNode('nD_datasets/twoD');
  await selectVisTab(Vis.Heatmap);

  // Ensure that the dimension mapper is visible for X and Y
  const xRadioGroup = screen.getByLabelText('Dimension as x axis');
  expect(xRadioGroup).toBeVisible();
  const yRadioGroup = screen.getByLabelText('Dimension as y axis');
  expect(yRadioGroup).toBeVisible();

  // Ensure that the default mapping is ['y', 'x']
  const xD1Button = within(xRadioGroup).getByRole('radio', { name: 'D1' });
  expect(xD1Button).toBeChecked();
  const yD0Button = within(yRadioGroup).getByRole('radio', { name: 'D0' });
  expect(yD0Button).toBeChecked();

  // Ensure that the swap from ['y', 'x'] to ['x', 'y'] works
  const xD0Button = within(xRadioGroup).getByRole('radio', { name: 'D0' });
  userEvent.click(xD0Button);
  expect(xD0Button).toBeChecked();
  expect(xD1Button).not.toBeChecked();

  const yD1Button = within(yRadioGroup).getByRole('radio', { name: 'D1' });
  expect(yD0Button).not.toBeChecked();
  expect(yD1Button).toBeChecked();
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
