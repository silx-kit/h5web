import React from 'react';
import {
  render,
  RenderResult,
  fireEvent,
  waitFor,
  screen,
  within,
} from '@testing-library/react';
import App from './App';
import MockProvider from './providers/mock/MockProvider';

const DOMAIN = 'source.h5';

function renderApp(): RenderResult {
  return render(
    <MockProvider domain={DOMAIN}>
      <App />
    </MockProvider>
  );
}

test('renders with root group selected', async () => {
  renderApp();

  const noVisText = await screen.findByText('Nothing to visualize');
  expect(noVisText).toBeVisible();

  const title = screen.getByRole('heading', { name: DOMAIN });
  expect(title).toBeVisible();

  const domainBtn = screen.getByRole('treeitem', { name: DOMAIN });
  expect(domainBtn).toBeVisible();
  expect(domainBtn).toHaveAttribute('aria-selected', 'true');
});

test('switch between "display" and "inspect" modes', async () => {
  renderApp();

  const inspectBtn = await screen.findByRole('tab', { name: 'Inspect' });
  const displayBtn = screen.getByRole('tab', { name: 'Display' });

  // Switch to "inspect" mode
  fireEvent.click(inspectBtn);
  const visSelector1 = screen.queryByRole('tablist', {
    name: 'Visualization',
  });
  expect(visSelector1).not.toBeInTheDocument();

  const groupIdRow1 = await screen.findByRole('row', { name: /Entity ID/u });
  expect(groupIdRow1).toBeVisible();

  // Switch back to "display" mode
  fireEvent.click(displayBtn);

  const groupIdRow2 = screen.queryByRole('row', { name: /Entity ID/u });
  expect(groupIdRow2).not.toBeInTheDocument();

  const visSelector2 = await screen.findByRole('tablist', {
    name: 'Visualization',
  });
  expect(visSelector2).toBeVisible();
});

test('toggle explorer sidebar', async () => {
  renderApp();

  const domainBtn = await screen.findByRole('treeitem', { name: DOMAIN });
  const sidebarBtn = screen.getByRole('button', {
    name: 'Toggle explorer sidebar',
  });

  expect(domainBtn).toBeVisible();
  expect(sidebarBtn).toHaveAttribute('aria-pressed', 'true');

  fireEvent.click(sidebarBtn);
  expect(domainBtn).not.toBeVisible();
  expect(sidebarBtn).toHaveAttribute('aria-pressed', 'false');

  fireEvent.click(sidebarBtn);
  expect(domainBtn).toBeVisible();
  expect(sidebarBtn).toHaveAttribute('aria-pressed', 'true');
});

test('navigate groups in explorer', async () => {
  renderApp();

  const groupBtn = await screen.findByRole('treeitem', { name: 'entities' });
  expect(groupBtn).toHaveAttribute('aria-selected', 'false');
  expect(groupBtn).toHaveAttribute('aria-expanded', 'false');

  // Expand `entities` group
  fireEvent.click(groupBtn);

  expect(groupBtn).toHaveAttribute('aria-selected', 'true');
  expect(groupBtn).toHaveAttribute('aria-expanded', 'true');

  const childGroupBtn = screen.getByRole('treeitem', { name: 'empty_group' });
  expect(childGroupBtn).toHaveAttribute('aria-selected', 'false');
  expect(childGroupBtn).toHaveAttribute('aria-expanded', 'false');

  // Expand `empty_group` child group
  fireEvent.click(childGroupBtn);

  expect(groupBtn).toHaveAttribute('aria-selected', 'false');
  expect(groupBtn).toHaveAttribute('aria-expanded', 'true');
  expect(childGroupBtn).toHaveAttribute('aria-selected', 'true');
  expect(childGroupBtn).toHaveAttribute('aria-expanded', 'true');

  // Collapse `empty_group` child group
  fireEvent.click(childGroupBtn);

  expect(childGroupBtn).toHaveAttribute('aria-selected', 'true');
  expect(childGroupBtn).toHaveAttribute('aria-expanded', 'false');

  // Select `entities` group
  fireEvent.click(groupBtn);

  expect(groupBtn).toHaveAttribute('aria-selected', 'true');
  expect(groupBtn).toHaveAttribute('aria-expanded', 'true'); // remains expanded as it wasn't previously selected
  expect(childGroupBtn).toHaveAttribute('aria-selected', 'false');

  // Collapse `entities` group
  fireEvent.click(groupBtn);

  expect(
    screen.queryByRole('treeitem', { name: 'empty_group' })
  ).not.toBeInTheDocument();
  expect(groupBtn).toHaveAttribute('aria-selected', 'true');
  expect(groupBtn).toHaveAttribute('aria-expanded', 'false');
});

test('visualise scalar dataset', async () => {
  renderApp();

  fireEvent.click(await screen.findByRole('treeitem', { name: 'entities' }));
  const datasetBtn = screen.getByRole('treeitem', { name: 'scalar_int' });
  expect(datasetBtn).toBeVisible();

  fireEvent.click(datasetBtn);
  expect(datasetBtn).toHaveAttribute('aria-selected', 'true');
  expect(datasetBtn).not.toHaveAttribute('aria-expanded'); // a dataset cannot be expanded

  const scalarTab = await screen.findByRole('tab', { name: 'Scalar' });
  expect(scalarTab).toBeVisible();
  expect(scalarTab).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByText('0')).toBeVisible();

  fireEvent.click(screen.getByRole('treeitem', { name: 'scalar_str' }));
  expect(await screen.findByText('foo')).toBeVisible();
});

test('inspect scalar dataset', async () => {
  renderApp();

  // Select the datatype entities/scalar_int
  fireEvent.click(await screen.findByRole('treeitem', { name: 'entities' }));
  fireEvent.click(screen.getByRole('treeitem', { name: 'scalar_int' }));

  // Switch to "inspect" mode
  const inspectBtn = await screen.findByRole('tab', { name: 'Inspect' });
  fireEvent.click(inspectBtn);

  const visSelector1 = screen.queryByRole('tablist', {
    name: 'Visualization',
  });
  expect(visSelector1).not.toBeInTheDocument();

  const shapeRow = screen.getByRole('row', { name: /Shape/u });
  expect(shapeRow).toBeVisible();
});

test('switch visualisations', async () => {
  renderApp();

  // Select the 1D dataset nD_datasets/oneD
  fireEvent.click(await screen.findByRole('treeitem', { name: 'nD_datasets' }));
  const datasetBtn = screen.getByRole('treeitem', { name: 'oneD' });
  fireEvent.click(datasetBtn);

  const lineTab = await screen.findByRole('tab', { name: 'Line' });
  expect(lineTab).toBeVisible();
  expect(lineTab).toHaveAttribute('aria-selected', 'true');

  const matrixTab = screen.getByRole('tab', { name: 'Matrix' });
  expect(matrixTab).toBeVisible();
  expect(matrixTab).toHaveAttribute('aria-selected', 'false');

  // Switch to Matrix visualisation
  fireEvent.click(matrixTab);

  await waitFor(() => {
    expect(matrixTab).toHaveAttribute('aria-selected', 'true');
    expect(lineTab).toHaveAttribute('aria-selected', 'false');
  });
});

test('display mapping for X axis when visualizing 2D dataset as Line', async () => {
  renderApp();

  // Select the 2D dataset nD_datasets/twoD
  fireEvent.click(await screen.findByRole('treeitem', { name: 'nD_datasets' }));
  fireEvent.click(screen.getByRole('treeitem', { name: 'twoD' }));

  // Select the line vis
  fireEvent.click(await screen.findByRole('tab', { name: 'Line' }));

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
  const D0Slider = screen.getByRole('slider');
  expect(D0Slider).toHaveAttribute('aria-valueNow', '0');

  // Ensure that the swap from [0, 'x'] to ['x', 0] works
  fireEvent.click(xDimsButtons[0]);

  await waitFor(() => {
    expect(xDimsButtons[0]).toBeChecked();
    expect(xDimsButtons[1]).not.toBeChecked();
    const D1Slider = screen.getByRole('slider');
    expect(D1Slider).toHaveAttribute('aria-valueNow', '0');
  });
});

test('display mappings for X and Y axes when visualizing 2D dataset as Heatmap', async () => {
  renderApp();

  // Select the 2D dataset nD_datasets/twoD
  fireEvent.click(await screen.findByRole('treeitem', { name: 'nD_datasets' }));
  fireEvent.click(screen.getByRole('treeitem', { name: 'twoD' }));

  // Ensure that the heatmap vis is selected
  const heatmapTab = await screen.findByRole('tab', { name: 'Heatmap' });
  expect(heatmapTab).toHaveAttribute('aria-selected', 'true');

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
  fireEvent.click(xD0Button);
  expect(xD0Button).toBeChecked();
  expect(xD1Button).not.toBeChecked();

  const yD1Button = within(yRadioGroup).getByRole('radio', { name: 'D1' });
  expect(yD0Button).not.toBeChecked();
  expect(yD1Button).toBeChecked();
});

test('display one dimension slider and mappings for X and Y axes when visualizing 3D dataset as Matrix', async () => {
  renderApp();

  // Select the 3D dataset nD_datasets/threeD
  fireEvent.click(await screen.findByRole('treeitem', { name: 'nD_datasets' }));
  fireEvent.click(screen.getByRole('treeitem', { name: 'threeD' }));

  // Select the matrix vis
  fireEvent.click(await screen.findByRole('tab', { name: 'Matrix' }));

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
  const D0Slider = screen.getByRole('slider');
  expect(D0Slider).toHaveAttribute('aria-valueNow', '0');
});
