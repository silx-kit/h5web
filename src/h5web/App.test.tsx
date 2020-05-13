import React from 'react';
import {
  render,
  RenderResult,
  fireEvent,
  waitFor,
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
  const {
    findByRole,
    findByText,
    getByRole,
    queryByRole,
    queryByText,
  } = renderApp();

  const inspectBtn = getByRole('tab', { name: 'Inspect' });
  const displayBtn = getByRole('tab', { name: 'Display' });

  // Switch to "inspect" mode
  fireEvent.click(inspectBtn);

  const noVisText1 = queryByText('Nothing to visualize');
  expect(noVisText1).not.toBeInTheDocument();

  const groupIdRow1 = await findByRole('row', { name: /Entity ID/ });
  expect(groupIdRow1).toBeVisible();

  // Switch back to "display" mode
  fireEvent.click(displayBtn);

  const groupIdRow2 = queryByRole('row', { name: /Entity ID/ });
  expect(groupIdRow2).not.toBeInTheDocument();

  const noVisText2 = await findByText('Nothing to visualize');
  expect(noVisText2).toBeVisible();
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

  // `waitFor` avoids warning due to async work occurring after completion of test
  await waitFor(() => {
    expect(groupBtn).toHaveAttribute('aria-selected', 'true');
    expect(groupBtn).toHaveAttribute('aria-expanded', 'false');
  });
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

  // Switching visualisations
  fireEvent.click(matrixTab);
  expect(matrixTab).toHaveAttribute('aria-selected', 'true');
  expect(lineTab).toHaveAttribute('aria-selected', 'false');
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
