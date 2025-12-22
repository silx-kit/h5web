import { screen, waitFor } from '@testing-library/react';
import { expect, test } from 'vitest';

import { SLOW_TIMEOUT } from '../providers/mock/utils';
import { getExplorerItem, renderApp } from '../test-utils';

test('select root group by default', async () => {
  await renderApp();

  const title = screen.getByRole('heading', { name: 'source.h5' });
  expect(title).toBeVisible();

  const fileBtn = getExplorerItem('source.h5');
  expect(fileBtn).toBeVisible();
  expect(fileBtn).toHaveAttribute('aria-selected', 'true');
});

test('toggle sidebar', async () => {
  const { user } = await renderApp();

  const fileBtn = getExplorerItem('source.h5');
  const sidebarBtn = screen.getByRole('button', {
    name: 'Toggle sidebar',
  });

  expect(fileBtn).toBeVisible();
  expect(sidebarBtn).toBePressed();

  await user.click(sidebarBtn);
  expect(fileBtn).not.toBeVisible();
  expect(sidebarBtn).not.toBePressed();

  await user.click(sidebarBtn);
  expect(fileBtn).toBeVisible();
  expect(sidebarBtn).toBePressed();
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

  const childGroupBtn = getExplorerItem('empty_group');
  expect(childGroupBtn).toHaveAttribute('aria-selected', 'false');
  expect(childGroupBtn).toHaveAttribute('aria-expanded', 'false');

  // Expand `empty_group` child group
  await selectExplorerNode('empty_group');
  expect(groupBtn).toHaveAttribute('aria-selected', 'false');
  expect(groupBtn).toHaveAttribute('aria-expanded', 'true');
  expect(childGroupBtn).toHaveAttribute('aria-selected', 'true');
  expect(childGroupBtn).toHaveAttribute('aria-expanded', 'true');

  // Collapse `empty_group` child group
  await selectExplorerNode('empty_group');
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
    screen.queryByRole('treeitem', { name: 'empty_group' }),
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
  expect(getExplorerItem('nD_datasets')).toHaveFocus();

  await user.keyboard('{ArrowUp}{ArrowUp}');
  expect(rootItem).toHaveFocus();

  // Arrow right to give focus to first child
  await user.keyboard('{ArrowRight}');
  const entitiesItem = getExplorerItem('entities');
  expect(entitiesItem).toHaveFocus();
  expect(entitiesItem).toHaveAttribute('aria-expanded', 'false'); // still collapsed

  // Arrow right again to expand group
  await user.keyboard('{ArrowRight}');
  expect(entitiesItem).toHaveFocus(); // still focused
  expect(entitiesItem).toHaveAttribute('aria-expanded', 'true'); // now expanded

  await user.keyboard('{ArrowRight}{ArrowRight}');
  const emptyGroupItem = getExplorerItem('empty_group');
  await waitFor(() => {
    expect(emptyGroupItem).toHaveFocus();
  });
  expect(emptyGroupItem).toHaveAttribute('aria-expanded', 'true');

  // Arrow right does nothing when group is empty or focused item is not a group
  await user.keyboard('{ArrowRight}');
  expect(emptyGroupItem).toHaveFocus();
  expect(emptyGroupItem).toHaveAttribute('aria-expanded', 'true');

  await user.keyboard('{ArrowDown}{ArrowRight}');
  expect(getExplorerItem('empty_dataset')).toHaveFocus();

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
  expect(entitiesItem).toHaveAttribute('aria-selected', 'true');
  expect(entitiesItem).toHaveAttribute('aria-expanded', 'true');

  await user.keyboard('{ArrowDown}{ArrowDown}');

  // Enter to select dataset
  await user.keyboard('{Enter}');
  await waitFor(() => {
    expect(getExplorerItem('empty_dataset')).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  await user.keyboard('{ArrowUp}{ArrowUp}');

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
  const lastItem = getExplorerItem('resilience');

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
  await renderApp({
    initialPath: '/resilience/slow_metadata',
    withFakeTimers: true,
  });

  // Wait for `slow_metadata` group to appear in explorer (i.e. for root and `resilience` groups to finish loading)
  await expect(
    screen.findByRole('treeitem', { name: 'slow_metadata' }),
  ).resolves.toBeVisible();

  // Ensure explorer now shows loading spinner (i.e. for `slow_metadata` group)
  expect(screen.getByLabelText(/Loading group/)).toBeVisible();

  // Wait for fetch of group metadata to succeed
  await expect(
    screen.findByText(/Nothing to display/, undefined, {
      timeout: SLOW_TIMEOUT,
    }),
  ).resolves.toBeVisible();

  // Ensure loading spinner has been removed
  expect(screen.queryByLabelText(/Loading group/)).not.toBeInTheDocument();
});
