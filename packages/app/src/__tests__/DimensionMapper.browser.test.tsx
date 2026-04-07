import { expect, test } from 'vitest';
import { page } from 'vitest/browser';

import { getDimMappingBtn, getMainArea, renderApp } from '../test-utils';
import { Vis } from '../vis-packs/core/visualizations';

test('control mapping for X axis when visualizing 2D dataset as line', async () => {
  await renderApp({
    initialPath: '/arrays/twoD',
    preferredVis: Vis.Line,
  });

  // Ensure that only one dimension mapper for X is visible
  const xRadioGroup = page.getByLabelText('Dimension as x axis');
  const yRadioGroup = page.getByLabelText('Dimension as y axis');
  expect(xRadioGroup).toBeVisible();
  expect(yRadioGroup).not.toBeInTheDocument();

  // Ensure that default mapping is [0, 'x']
  const xDimsButtons = xRadioGroup.getByRole('radio');
  expect(xDimsButtons).toHaveLength(2);
  expect(xDimsButtons.nth(0)).not.toBeChecked();
  expect(xDimsButtons.nth(1)).toBeChecked();

  // Ensure that only one dimension slider for D0 is visible
  const d0Slider = page.getByRole('slider', { name: 'D0' });
  expect(d0Slider).toBeVisible();
  expect(d0Slider).toHaveValue(0);
  expect(page.getByRole('slider', { name: 'D1' })).not.toBeInTheDocument();

  // Change mapping from [0, 'x'] to ['x', 0]
  await xDimsButtons.first().click();
  expect(xDimsButtons.nth(0)).toBeChecked();
  expect(xDimsButtons.nth(1)).not.toBeChecked();

  // Ensure that dimension slider is now for D1
  const d1Slider = page.getByRole('slider', { name: 'D1' });
  expect(d1Slider).toBeVisible();
  expect(d1Slider).toHaveValue(0);
  expect(page.getByRole('slider', { name: 'D0' })).not.toBeInTheDocument();
});

test('control mapping for X and Y axes when visualizing 2D dataset as heatmap', async () => {
  await renderApp({
    initialPath: '/arrays/twoD',
    preferredVis: Vis.Heatmap,
  });

  // Ensure that two dimension mappers for X and Y are visible
  const xRadioGroup = page.getByLabelText('Dimension as x axis');
  const yRadioGroup = page.getByLabelText('Dimension as y axis');
  expect(xRadioGroup).toBeVisible();
  expect(yRadioGroup).toBeVisible();

  const xD0Button = xRadioGroup.getByRole('radio', { name: 'D0' });
  const xD1Button = xRadioGroup.getByRole('radio', { name: 'D1' });
  const yD0Button = yRadioGroup.getByRole('radio', { name: 'D0' });
  const yD1Button = yRadioGroup.getByRole('radio', { name: 'D1' });

  // Ensure that default mapping is ['y', 'x']
  expect(xD1Button).toBeChecked();
  expect(yD0Button).toBeChecked();

  // Change mapping from ['y', 'x'] to ['x', 'y']
  await xD0Button.click();
  expect(xD0Button).toBeChecked();
  expect(xD1Button).not.toBeChecked();
  expect(yD0Button).not.toBeChecked();
  expect(yD1Button).toBeChecked();
});

test('display one slider and two mappers when visualizing 3D dataset as matrix', async () => {
  await renderApp({
    initialPath: '/arrays/threeD',
    preferredVis: Vis.Matrix,
  });

  // Ensure that two dimension mappers for X and Y are visible
  const xRadioGroup = page.getByLabelText('Dimension as x axis');
  const xDimsButtons = xRadioGroup.getByRole('radio');
  expect(xRadioGroup).toBeVisible();
  expect(xDimsButtons).toHaveLength(3);

  const yRadioGroup = page.getByLabelText('Dimension as y axis');
  const yDimsButtons = yRadioGroup.getByRole('radio');
  expect(yRadioGroup).toBeVisible();
  expect(yDimsButtons).toHaveLength(3);

  // Ensure that default mapping is [0, 'y', 'x']
  expect(xDimsButtons.nth(2)).toBeChecked();
  expect(yDimsButtons.nth(1)).toBeChecked();
  expect(page.getByRole('slider', { name: 'D0' })).toHaveValue(0);
});

test('display two sliders and two mappers when visualizing 4D dataset as heatmap', async () => {
  await renderApp('/arrays/fourD');

  // Ensure that two dimension mappers for X and Y are visible
  const xRadioGroup = page.getByLabelText('Dimension as x axis');
  const xDimsButtons = xRadioGroup.getByRole('radio');
  expect(xRadioGroup).toBeVisible();
  expect(xDimsButtons).toHaveLength(4);

  const yRadioGroup = page.getByLabelText('Dimension as y axis');
  const yDimsButtons = yRadioGroup.getByRole('radio');
  expect(yRadioGroup).toBeVisible();
  expect(yDimsButtons).toHaveLength(4);

  // Ensure that default mapping is [0, 0, 'y', 'x']
  expect(xDimsButtons.nth(3)).toBeChecked();
  expect(yDimsButtons.nth(2)).toBeChecked();
  expect(page.getByRole('slider', { name: 'D0' })).toHaveValue(0);
  expect(page.getByRole('slider', { name: 'D1' })).toHaveValue(0);

  if (import.meta.env.VITE_TEST_WITH_SCREENSHOTS) {
    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    });
    await expect(getMainArea()).toMatchScreenshot();
  }
});

test('remap dimensions of 4D dataset as heatmap', async () => {
  await renderApp('/arrays/fourD');

  const yRadioGroup = page.getByLabelText('Dimension as y axis');
  const d1Btn = yRadioGroup.getByRole('radio', { name: 'D1' });

  await d1Btn.click();
  expect(d1Btn).toBeChecked();
  expect(page.getByRole('slider', { name: 'D0' })).toHaveValue(0);
  expect(page.getByRole('slider', { name: 'D2' })).toHaveValue(0);

  if (import.meta.env.VITE_TEST_WITH_SCREENSHOTS) {
    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    });
    await expect(getMainArea()).toMatchScreenshot();
  }
});

test('slice through 2D dataset as line', async () => {
  const { user } = await renderApp({
    initialPath: '/arrays/twoD',
    preferredVis: Vis.Line,
  });

  // Move to next slice with keyboard
  const d0Slider = page.getByRole('slider', { name: 'D0' });
  await user.type(d0Slider, '{ArrowUp}');

  expect(d0Slider).toHaveValue(1);
});

test('slice through 2D opaque dataset', async () => {
  const { user } = await renderApp('/arrays/twoD_opaque');

  expect(page.getByText('Uint8Array [ 0,1 ]')).toBeVisible();

  // Move to next slice with keyboard
  const d0Slider = page.getByRole('slider', { name: 'D0' });
  await user.type(d0Slider, '{ArrowUp}');

  expect(d0Slider).toHaveValue(1);
  await expect.element(page.getByText('Uint8Array [ 4,5 ]')).toBeVisible();
});

test('slice through 4D dataset as heatmap', async () => {
  const { user } = await renderApp('/arrays/fourD');

  const d1Slider = page.getByRole('slider', { name: 'D1' });
  expect(d1Slider).toHaveAttribute('aria-valuemin', '0');
  expect(d1Slider).toHaveAttribute('aria-valuemax', '8');

  // Move to fourth slice with keyboard
  await user.type(d1Slider, '{ArrowUp}{ArrowUp}{ArrowUp}');

  await expect.element(page.getByLabelText('Min: −1e+0')).toBeVisible();
  expect(page.getByLabelText('Max: 9.996e-1')).toBeVisible();
  expect(d1Slider).toHaveValue(3);

  if (import.meta.env.VITE_TEST_WITH_SCREENSHOTS) {
    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    });
    await expect(getMainArea()).toMatchScreenshot();
  }
});

test('maintain mapping when switching to inspect mode and back', async () => {
  await renderApp({
    initialPath: '/arrays/twoD',
    preferredVis: Vis.Heatmap,
  });

  // Swap axes for D0 and D1
  await getDimMappingBtn('x', 0).click();

  // Toggle inspect mode
  await page.getByRole('tab', { name: 'Inspect' }).click();
  await page.getByRole('tab', { name: 'Display' }).click();

  expect(getDimMappingBtn('x', 0)).toBeChecked();
  expect(getDimMappingBtn('x', 1)).not.toBeChecked();
});

test('maintain mapping when switching to visualization with same axes count', async () => {
  const { selectVisTab } = await renderApp({
    initialPath: '/arrays/twoD',
    preferredVis: Vis.Heatmap,
  });

  // Swap axes for D0 and D1
  await getDimMappingBtn('x', 0).click();

  // Switch to Matrix visualization
  await selectVisTab(Vis.Matrix);

  expect(getDimMappingBtn('x', 0)).toBeChecked();
  expect(getDimMappingBtn('x', 1)).not.toBeChecked();
});

test('maintain mapping when switching to dataset with same dimensions', async () => {
  const { selectExplorerNode } = await renderApp({
    initialPath: '/arrays/twoD_boolean',
    preferredVis: Vis.Line,
  });

  // Swap axes for D0 and D1
  await getDimMappingBtn('x', 0).click();

  // Switch to dataset with same dimensions
  await selectExplorerNode('twoD_enum');

  expect(getDimMappingBtn('x', 0)).toBeChecked();
  expect(getDimMappingBtn('x', 1)).not.toBeChecked();
});

test('reset mapping when switching to visualization with different axes count', async () => {
  const { selectVisTab } = await renderApp({
    initialPath: '/arrays/twoD',
    preferredVis: Vis.Heatmap,
  });

  // Swap axes for D0 and D1
  await getDimMappingBtn('x', 0).click();

  // Switch to Line visualization
  await selectVisTab(Vis.Line);

  expect(getDimMappingBtn('x', 0)).not.toBeChecked();
  expect(getDimMappingBtn('x', 1)).toBeChecked();
});

test('reset mapping when switching to dataset with different dimensions', async () => {
  const { selectExplorerNode } = await renderApp({
    initialPath: '/arrays/twoD',
    preferredVis: Vis.Heatmap,
  });

  // Swap axes for D0 and D1
  await getDimMappingBtn('x', 0).click();

  // Switch to dataset with different dimensions
  await selectExplorerNode('twoD_complex');

  expect(getDimMappingBtn('x', 0)).not.toBeChecked();
  expect(getDimMappingBtn('x', 1)).toBeChecked();
});
