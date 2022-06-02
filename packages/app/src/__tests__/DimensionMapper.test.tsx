import { screen, waitFor, within } from '@testing-library/react';

import { renderApp } from '../test-utils';
import { Vis } from '../vis-packs/core/visualizations';

test('control mapping for X axis when visualizing 2D dataset as Line', async () => {
  const { user } = await renderApp({
    initialPath: '/nD_datasets/twoD',
    preferredVis: Vis.Line,
  });

  // Ensure that only one dimension mapper for X is visible
  const xRadioGroup = screen.getByLabelText('Dimension as x axis');
  const yRadioGroup = screen.queryByLabelText('Dimension as y axis');
  expect(xRadioGroup).toBeVisible();
  expect(yRadioGroup).not.toBeInTheDocument();

  // Ensure that the default mapping is [0, 'x']
  const xDimsButtons = within(xRadioGroup).getAllByRole('radio');
  expect(xDimsButtons).toHaveLength(2);
  expect(xDimsButtons[0]).not.toBeChecked();
  expect(xDimsButtons[1]).toBeChecked();

  // Ensure that only one dimension slider for D0 is visible
  const d0Slider = screen.getByRole('slider', { name: 'D0' });
  expect(d0Slider).toBeVisible();
  expect(d0Slider).toHaveAttribute('aria-valueNow', '0');
  expect(screen.queryByRole('slider', { name: 'D1' })).not.toBeInTheDocument();

  // Change mapping from [0, 'x'] to ['x', 0]
  await user.click(xDimsButtons[0]);
  await waitFor(() => expect(xDimsButtons[0]).toBeChecked());
  expect(xDimsButtons[1]).not.toBeChecked();

  // Ensure that the dimension slider is now for D1
  const d1Slider = screen.getByRole('slider', { name: 'D1' });
  expect(d1Slider).toBeVisible();
  expect(d1Slider).toHaveAttribute('aria-valueNow', '0');
  expect(screen.queryByRole('slider', { name: 'D0' })).not.toBeInTheDocument();
});

test('control mapping for X and Y axes when visualizing 2D dataset as Heatmap', async () => {
  const { user } = await renderApp({
    initialPath: '/nD_datasets/twoD',
    preferredVis: Vis.Heatmap,
  });

  // Ensure that two dimension mappers for X and Y are visible
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

  // Change mapping from ['y', 'x'] to ['x', 'y']
  await user.click(xD0Button);
  await waitFor(() => expect(xD0Button).toBeChecked());
  expect(xD1Button).not.toBeChecked();
  expect(yD0Button).not.toBeChecked();
  expect(yD1Button).toBeChecked();
});

test('display one slider and two mappers when visualizing 3D dataset as Matrix', async () => {
  await renderApp({
    initialPath: '/nD_datasets/threeD',
    preferredVis: Vis.Matrix,
  });

  // Ensure that two dimension mappers for X and Y are visible
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

  // Ensure that only one dimension slider for D0 is visible
  const d0Slider = screen.getByRole('slider', { name: 'D0' });
  expect(d0Slider).toHaveAttribute('aria-valueNow', '0');
  expect(screen.queryByRole('slider', { name: 'D1' })).not.toBeInTheDocument();
});

test('slice through 2D dataset', async () => {
  const { user } = await renderApp({
    initialPath: '/nD_datasets/twoD',
    preferredVis: Vis.Line,
  });

  // Move to next slice with keyboard
  const d0Slider = screen.getByRole('slider', { name: 'D0' });
  await user.type(d0Slider, '{ArrowUp}');

  expect(d0Slider).toHaveAttribute('aria-valuenow', '1');
});
