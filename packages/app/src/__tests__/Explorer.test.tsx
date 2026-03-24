import { expect, test } from 'vitest';
import { page } from 'vitest/browser';

import {
  getExplorerItem,
  getNexusExplorerItem,
  mockDelay,
  renderApp,
  waitForAllLoaders,
} from '../test-utils';

test('select root group by default', async () => {
  await renderApp();

  const title = page.getByRole('heading', { name: 'source.h5' });
  expect(title).toBeVisible();

  const fileBtn = getExplorerItem('source.h5');
  expect(fileBtn).toBeVisible();
  expect(fileBtn).toHaveAttribute('aria-selected', 'true');
});

test('toggle sidebar', async () => {
  await renderApp();

  const sidebarBtn = page.getByRole('button', { name: 'Toggle sidebar' });

  expect(getExplorerItem('source.h5')).toBeVisible();
  expect(sidebarBtn).toHaveAttribute('aria-pressed', 'true');

  await sidebarBtn.click();
  await expect.element(getExplorerItem('source.h5')).not.toBeInTheDocument();
  expect(sidebarBtn).toHaveAttribute('aria-pressed', 'false');

  await sidebarBtn.click();
  await expect.element(getExplorerItem('source.h5')).toBeVisible();
  expect(sidebarBtn).toHaveAttribute('aria-pressed', 'true');
});

test('resize and collapse/expand sidebar with keyboard', async () => {
  const { user } = await renderApp();

  const splitter = page.getByRole('separator');
  expect(splitter).toHaveAttribute('aria-valuenow', '25');

  // Resize sidebar to minimum width
  await user.type(splitter, '{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}');
  expect(splitter).toHaveAttribute('aria-valuenow', '7.817'); // min size (150px) / viewport (1920px)

  // Collapse
  await user.type(splitter, '{ArrowLeft}');
  expect(splitter).toHaveAttribute('aria-valuenow', '0'); // collapsed
  await expect.element(getExplorerItem('source.h5')).not.toBeInTheDocument();

  // Expand
  await user.type(splitter, '{ArrowRight}');
  expect(splitter).toHaveAttribute('aria-valuenow', '7.817');
  await expect.element(getExplorerItem('source.h5')).toBeVisible();
});

test('remember sidebar width when toggling', async () => {
  const { user } = await renderApp();

  const splitter = page.getByRole('separator');
  expect(splitter).toHaveAttribute('aria-valuenow', '25');

  // Resize sidebar
  await user.type(splitter, '{ArrowRight}');
  expect(splitter).toHaveAttribute('aria-valuenow', '30');

  // Collapse
  const sidebarBtn = page.getByRole('button', { name: 'Toggle sidebar' });
  await sidebarBtn.click();
  expect(splitter).toHaveAttribute('aria-valuenow', '0');

  // Expand
  await sidebarBtn.click();
  expect(splitter).toHaveAttribute('aria-valuenow', '30');
});

test('navigate groups in explorer', async () => {
  const { selectExplorerNode } = await renderApp();

  const groupBtn = getExplorerItem('entities');
  expect(groupBtn).toHaveAttribute('aria-selected', 'false');
  expect(groupBtn).toHaveAttribute('aria-expanded', 'false');

  // Expand `entities` group
  await selectExplorerNode('entities');
  expect(groupBtn).toHaveAttribute('aria-selected', 'true');
  expect(groupBtn).toHaveAttribute('aria-expanded', 'true');

  const childGroupBtn = getExplorerItem('group_empty');
  expect(childGroupBtn).toHaveAttribute('aria-selected', 'false');
  expect(childGroupBtn).toHaveAttribute('aria-expanded', 'false');

  // Expand `group_empty` child group
  await selectExplorerNode('group_empty');
  expect(groupBtn).toHaveAttribute('aria-selected', 'false');
  expect(groupBtn).toHaveAttribute('aria-expanded', 'true');
  expect(childGroupBtn).toHaveAttribute('aria-selected', 'true');
  expect(childGroupBtn).toHaveAttribute('aria-expanded', 'true');

  // Collapse `group_empty` child group
  await selectExplorerNode('group_empty');
  expect(childGroupBtn).toHaveAttribute('aria-selected', 'true');
  expect(childGroupBtn).toHaveAttribute('aria-expanded', 'false');

  // Select `entities` group
  await selectExplorerNode('entities');
  expect(groupBtn).toHaveAttribute('aria-selected', 'true');
  expect(groupBtn).toHaveAttribute('aria-expanded', 'true'); // remains expanded as it wasn't previously selected
  expect(childGroupBtn).toHaveAttribute('aria-selected', 'false');

  // Collapse `entities` group
  await selectExplorerNode('entities');
  expect(
    page.getByRole('treeitem', { name: 'group_empty' }),
  ).not.toBeInTheDocument();
  expect(groupBtn).toHaveAttribute('aria-selected', 'true');
  expect(groupBtn).toHaveAttribute('aria-expanded', 'false');

  // Reselect root group
  await selectExplorerNode('source.h5');
  expect(getExplorerItem('source.h5')).toHaveAttribute('aria-selected', 'true');
});

test('navigate with arrow keys', async () => {
  const { user } = await renderApp();

  const rootItem = getExplorerItem('source.h5');
  expect(rootItem).toHaveFocus();

  // Up/down arrows to move focus
  await user.keyboard('{ArrowDown}{ArrowDown}');
  expect(getExplorerItem('scalars')).toHaveFocus();

  await user.keyboard('{ArrowUp}{ArrowUp}');
  expect(rootItem).toHaveFocus();

  // Arrow right to give focus to first child
  await user.keyboard('{ArrowRight}');
  const entitiesItem = getExplorerItem('entities');
  expect(entitiesItem).toHaveFocus();
  expect(entitiesItem).toHaveAttribute('aria-expanded', 'false'); // still collapsed

  // Arrow right again to expand group
  await user.keyboard('{ArrowRight}');
  await waitForAllLoaders();
  expect(entitiesItem).toHaveFocus(); // still focused
  expect(entitiesItem).toHaveAttribute('aria-expanded', 'true'); // now expanded

  await user.keyboard('{ArrowRight}');
  const emptyGroupItem = getExplorerItem('group_empty');
  expect(emptyGroupItem).toHaveFocus();

  await user.keyboard('{ArrowRight}');
  await waitForAllLoaders();
  expect(emptyGroupItem).toHaveAttribute('aria-expanded', 'true');

  // Arrow right does nothing when group is empty or focused item is not a group
  await user.keyboard('{ArrowRight}');
  expect(emptyGroupItem).toHaveFocus();
  expect(emptyGroupItem).toHaveAttribute('aria-expanded', 'true');

  await user.keyboard('{ArrowDown}{ArrowDown}{ArrowRight}');
  expect(getExplorerItem('dataset_empty')).toHaveFocus();

  // Arrow left to give focus to parent group
  await user.keyboard('{ArrowLeft}');
  expect(entitiesItem).toHaveFocus();
  expect(entitiesItem).toHaveAttribute('aria-expanded', 'true'); // still expanded

  // Arrow left again to collapse group
  await user.keyboard('{ArrowLeft}');
  expect(entitiesItem).toHaveFocus();
  expect(entitiesItem).toHaveAttribute('aria-expanded', 'false');

  // Arrow left again to go give focus back to root group
  await user.keyboard('{ArrowLeft}');
  expect(rootItem).toHaveFocus();
});

test('select explorer items with enter key', async () => {
  const { user } = await renderApp();

  await user.keyboard('{ArrowDown}');
  const entitiesItem = getExplorerItem('entities');
  expect(entitiesItem).toHaveFocus();

  // Enter to select and expand
  await user.keyboard('{Enter}');
  await waitForAllLoaders();
  expect(entitiesItem).toHaveAttribute('aria-selected', 'true');
  expect(entitiesItem).toHaveAttribute('aria-expanded', 'true');

  await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
  const emptyDatasetItem = getExplorerItem('dataset_empty');
  expect(emptyDatasetItem).toHaveFocus();

  // Enter to select dataset
  await user.keyboard('{Enter}');
  await waitForAllLoaders();
  expect(emptyDatasetItem).toHaveAttribute('aria-selected', 'true');

  await user.keyboard('{ArrowUp}{ArrowUp}{ArrowUp}');
  expect(entitiesItem).toHaveFocus();

  // Enter to re-select expanded group
  await user.keyboard('{Enter}');
  expect(entitiesItem).toHaveAttribute('aria-selected', 'true');
  expect(entitiesItem).toHaveAttribute('aria-expanded', 'true'); // still expanded

  // Enter again to collapse
  await user.keyboard('{Enter}');
  expect(entitiesItem).toHaveAttribute('aria-expanded', 'false'); // now collapsed
});

test('navigate with home and end keys', async () => {
  const { user } = await renderApp();

  const root = getExplorerItem('source.h5');
  const lastItem = getNexusExplorerItem('resilience');

  // From root to last item
  await user.keyboard('{End}');
  expect(lastItem).toHaveFocus();

  // From last item to root
  await user.keyboard('{Home}');
  expect(root).toHaveFocus();

  // From any item to last item
  await user.keyboard('{ArrowDown}{End}');
  expect(lastItem).toHaveFocus();

  // From any item to to root
  await user.keyboard('{ArrowUp}{Home}');
  expect(root).toHaveFocus();
});

test('show spinner when group metadata is slow to fetch', async () => {
  const runAll = mockDelay();
  await renderApp({
    initialPath: '/resilience/slow_metadata',
    waitForLoaders: false,
  });

  // Wait for `slow_metadata` group to appear in explorer (i.e. for root and `resilience` groups to finish loading)
  await expect
    .element(page.getByRole('treeitem', { name: 'slow_metadata' }))
    .toBeVisible();

  // Ensure explorer now shows loading spinner (i.e. for `slow_metadata` group)
  await expect
    .element(page.getByLabelText('Loading group metadata...'))
    .toBeVisible();

  // Resolve delay
  runAll();

  // Wait for fetch of group metadata to succeed
  await expect.element(page.getByText('Nothing to display')).toBeVisible();

  // Ensure loading spinner has been removed
  await expect
    .element(page.getByLabelText('Loading group metadata...'))
    .not.toBeInTheDocument();
});
