import React from 'react';
import {
  render,
  RenderResult,
  fireEvent,
  waitFor,
  getByRole as getByRoleInElement,
  getAllByRole as getAllByRoleInElement,
} from '@testing-library/react';
import App from './App';
import MockProvider from './providers/mock/MockProvider';

const DOMAIN = 'bsa_002_000-integrate-sub';

function renderApp(): RenderResult {
  return render(
    <MockProvider domain={DOMAIN}>
      <App />
    </MockProvider>
  );
}

test('renders with root group selected', async () => {
  const { findByText, getByRole } = renderApp();

  const noVisText = await findByText('Nothing to visualize');
  expect(noVisText).toBeVisible();

  const title = getByRole('heading', { name: DOMAIN });
  expect(title).toBeVisible();

  const domainBtn = getByRole('treeitem', { name: DOMAIN });
  expect(domainBtn).toBeVisible();
  expect(domainBtn).toHaveAttribute('aria-selected', 'true');
});

test('switch between "display" and "inspect" modes', async () => {
  const { findByRole, getByRole, queryByRole } = renderApp();

  const inspectBtn = await findByRole('tab', { name: 'Inspect' });
  const displayBtn = getByRole('tab', { name: 'Display' });

  // Switch to "inspect" mode
  fireEvent.click(inspectBtn);
  const visSelector1 = queryByRole('tablist', { name: 'Visualization' });
  expect(visSelector1).not.toBeInTheDocument();

  const groupIdRow1 = await findByRole('row', { name: /Entity ID/ });
  expect(groupIdRow1).toBeVisible();

  // Switch back to "display" mode
  fireEvent.click(displayBtn);

  const groupIdRow2 = queryByRole('row', { name: /Entity ID/ });
  expect(groupIdRow2).not.toBeInTheDocument();

  const visSelector2 = await findByRole('tablist', { name: 'Visualization' });
  expect(visSelector2).toBeVisible();
});

test('toggle explorer sidebar', async () => {
  const { findByRole, getByRole } = renderApp();

  const domainBtn = await findByRole('treeitem', { name: DOMAIN });
  const sidebarBtn = getByRole('button', {
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
  const { findByRole, queryByRole, getByRole } = renderApp();

  const groupBtn = await findByRole('treeitem', { name: 'entry_0000' });
  expect(groupBtn).toHaveAttribute('aria-selected', 'false');
  expect(groupBtn).toHaveAttribute('aria-expanded', 'false');

  // Expand `entry_0000` group
  fireEvent.click(groupBtn);

  expect(groupBtn).toHaveAttribute('aria-selected', 'true');
  expect(groupBtn).toHaveAttribute('aria-expanded', 'true');

  const childGroupBtn = getByRole('treeitem', { name: '1_cormap' });
  expect(childGroupBtn).toHaveAttribute('aria-selected', 'false');
  expect(childGroupBtn).toHaveAttribute('aria-expanded', 'false');

  // Expand `1_cormap` child group
  fireEvent.click(childGroupBtn);

  expect(groupBtn).toHaveAttribute('aria-selected', 'false');
  expect(groupBtn).toHaveAttribute('aria-expanded', 'true');
  expect(childGroupBtn).toHaveAttribute('aria-selected', 'true');
  expect(childGroupBtn).toHaveAttribute('aria-expanded', 'true');

  // Collapse `1_cormap` child group
  fireEvent.click(childGroupBtn);

  expect(childGroupBtn).toHaveAttribute('aria-selected', 'true');
  expect(childGroupBtn).toHaveAttribute('aria-expanded', 'false');

  // Select `entry_0000` group
  fireEvent.click(groupBtn);

  expect(groupBtn).toHaveAttribute('aria-selected', 'true');
  expect(groupBtn).toHaveAttribute('aria-expanded', 'true'); // remains expanded as it wasn't previously selected
  expect(childGroupBtn).toHaveAttribute('aria-selected', 'false');

  // Collapse `entry_0000` group
  fireEvent.click(groupBtn);

  expect(queryByRole('treeitem', { name: '1_cormap' })).not.toBeInTheDocument();
  expect(groupBtn).toHaveAttribute('aria-selected', 'true');
  expect(groupBtn).toHaveAttribute('aria-expanded', 'false');
});

test('visualise a scalar dataset', async () => {
  const { findByRole, getByRole, getByText } = renderApp();

  // Select the scalar dataset entry_0000/1_cormap/version
  fireEvent.click(await findByRole('treeitem', { name: 'entry_0000' }));
  fireEvent.click(getByRole('treeitem', { name: '1_cormap' }));

  const datasetBtn = getByRole('treeitem', { name: 'version' });
  expect(datasetBtn).toBeVisible();

  fireEvent.click(datasetBtn);
  expect(datasetBtn).toHaveAttribute('aria-selected', 'true');
  expect(datasetBtn).not.toHaveAttribute('aria-expanded'); // A dataset cannot be expanded

  const scalarTab = await findByRole('tab', { name: 'Scalar' });
  expect(scalarTab).toBeVisible();
  expect(scalarTab).toHaveAttribute('aria-selected', 'true');

  const datasetValue = getByText('0.7.1');
  expect(datasetValue).toBeVisible();
});

test('switch visualisations', async () => {
  const { findByRole, getByRole } = renderApp();

  // Select the 1D dataset entry_0000/1_cormap/to_merge
  fireEvent.click(await findByRole('treeitem', { name: 'entry_0000' }));
  fireEvent.click(getByRole('treeitem', { name: '1_cormap' }));

  const datasetBtn = getByRole('treeitem', { name: 'to_merge' });
  fireEvent.click(datasetBtn);

  const lineTab = await findByRole('tab', { name: 'Line' });
  expect(lineTab).toBeVisible();
  expect(lineTab).toHaveAttribute('aria-selected', 'true');

  const matrixTab = getByRole('tab', { name: 'Matrix' });
  expect(matrixTab).toBeVisible();
  expect(matrixTab).toHaveAttribute('aria-selected', 'false');

  // Switch to Matrix visualisation
  fireEvent.click(matrixTab);

  await waitFor(() => {
    expect(matrixTab).toHaveAttribute('aria-selected', 'true');
    expect(lineTab).toHaveAttribute('aria-selected', 'false');
  });
});

test('inspect a dataset', async () => {
  const { getByRole, queryByRole, findByRole } = renderApp();

  // Select the 2D dataset entry_0000/1_cormap/results/count
  fireEvent.click(await findByRole('treeitem', { name: 'entry_0000' }));
  fireEvent.click(getByRole('treeitem', { name: '1_cormap' }));
  fireEvent.click(getByRole('treeitem', { name: 'results' }));
  fireEvent.click(getByRole('treeitem', { name: 'count' }));

  const inspectBtn = await findByRole('tab', { name: 'Inspect' });

  // Switch to "inspect" mode
  fireEvent.click(inspectBtn);

  const visSelector1 = queryByRole('tablist', { name: 'Visualization' });
  expect(visSelector1).not.toBeInTheDocument();

  const shapeRow = getByRole('row', { name: /Shape/ });
  expect(shapeRow).toBeVisible();
});

test('display mapping for X axis when visualizing 2D dataset as Line', async () => {
  const {
    getByRole,
    getByLabelText,
    queryByLabelText,
    findByRole,
  } = renderApp();

  // Select the 2D dataset nD/twoD
  fireEvent.click(await findByRole('treeitem', { name: 'nD' }));
  fireEvent.click(getByRole('treeitem', { name: 'twoD' }));

  // Select the line vis
  fireEvent.click(await findByRole('tab', { name: 'Line' }));

  // Ensure that the dimension mapper is only visible for X (and not for Y)
  const xRadioGroup = getByLabelText('Dimension as x axis');
  expect(xRadioGroup).toBeVisible();
  const xDimsButtons = getAllByRoleInElement(xRadioGroup, 'radio');
  expect(xDimsButtons).toHaveLength(2);
  const yRadioGroup = queryByLabelText('Dimension as y axis');
  expect(yRadioGroup).not.toBeInTheDocument();

  // Ensure that the default mapping is [0, 'x']
  expect(xDimsButtons[0]).not.toBeChecked();
  expect(xDimsButtons[1]).toBeChecked();
  const D0Slider = getByRole('slider');
  expect(D0Slider).toHaveAttribute('aria-valueNow', '0');

  // Ensure that the swap from [0, 'x'] to ['x', 0] works
  fireEvent.click(xDimsButtons[0]);

  await waitFor(() => {
    expect(xDimsButtons[0]).toBeChecked();
    expect(xDimsButtons[1]).not.toBeChecked();
    const D1Slider = getByRole('slider');
    expect(D1Slider).toHaveAttribute('aria-valueNow', '0');
  });
});

test('display mappings for X and Y axes when visualizing 2D dataset as Heatmap', async () => {
  const { getByRole, getByLabelText, findByRole } = renderApp();

  // Select the 2D dataset nD/twoD
  fireEvent.click(await findByRole('treeitem', { name: 'nD' }));
  fireEvent.click(getByRole('treeitem', { name: 'twoD' }));

  // Ensure that the heatmap vis is selected
  const heatmapTab = await findByRole('tab', { name: 'Heatmap' });
  expect(heatmapTab).toHaveAttribute('aria-selected', 'true');

  // Ensure that the dimension mapper is visible for X and Y
  const xRadioGroup = getByLabelText('Dimension as x axis');
  expect(xRadioGroup).toBeVisible();
  const yRadioGroup = getByLabelText('Dimension as y axis');
  expect(yRadioGroup).toBeVisible();

  // Ensure that the default mapping is ['y', 'x']
  const xD1Button = getByRoleInElement(xRadioGroup, 'radio', { name: 'D1' });
  expect(xD1Button).toBeChecked();
  const yD0Button = getByRoleInElement(yRadioGroup, 'radio', { name: 'D0' });
  expect(yD0Button).toBeChecked();

  // Ensure that the swap from ['y', 'x'] to ['x', 'y'] works
  const xD0Button = getByRoleInElement(xRadioGroup, 'radio', { name: 'D0' });
  fireEvent.click(xD0Button);
  expect(xD0Button).toBeChecked();
  expect(xD1Button).not.toBeChecked();

  const yD1Button = getByRoleInElement(yRadioGroup, 'radio', { name: 'D1' });
  expect(yD0Button).not.toBeChecked();
  expect(yD1Button).toBeChecked();
});

test('display one dimension slider and mappings for X and Y axes when visualizing 3D dataset as Matrix', async () => {
  const {
    getByRole,
    getByLabelText,
    findByRole,
    findByLabelText,
  } = renderApp();

  // Select the 3D dataset nD/threeD
  fireEvent.click(await findByRole('treeitem', { name: 'nD' }));
  fireEvent.click(getByRole('treeitem', { name: 'threeD' }));

  // Select the matrix vis
  fireEvent.click(await findByRole('tab', { name: 'Matrix' }));

  // Ensure that the dimension mapper is visible for X and Y
  const xRadioGroup = await findByLabelText('Dimension as x axis');
  expect(xRadioGroup).toBeVisible();
  const xDimsButtons = getAllByRoleInElement(xRadioGroup, 'radio');
  expect(xDimsButtons).toHaveLength(3);

  const yRadioGroup = getByLabelText('Dimension as y axis');
  expect(yRadioGroup).toBeVisible();
  const yDimsButtons = getAllByRoleInElement(yRadioGroup, 'radio');
  expect(yDimsButtons).toHaveLength(3);

  // Ensure that the default mapping is [0, 'y', 'x']
  expect(xDimsButtons[2]).toBeChecked();
  expect(yDimsButtons[1]).toBeChecked();
  const D0Slider = getByRole('slider');
  expect(D0Slider).toHaveAttribute('aria-valueNow', '0');
});
