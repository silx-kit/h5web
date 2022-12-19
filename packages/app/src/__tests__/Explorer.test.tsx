import { mockFilepath } from '@h5web/shared';
import { screen, waitFor } from '@testing-library/react';

import { renderApp } from '../test-utils';

test('select root group by default', async () => {
  await renderApp();

  const title = await screen.findByRole('heading', { name: mockFilepath });
  expect(title).toBeVisible();

  const fileBtn = screen.getByRole('treeitem', { name: mockFilepath });
  expect(fileBtn).toBeVisible();
  expect(fileBtn).toHaveAttribute('aria-selected', 'true');
});

test('toggle explorer sidebar', async () => {
  const { user } = await renderApp();

  const fileBtn = await screen.findByRole('treeitem', {
    name: mockFilepath,
  });
  const sidebarBtn = screen.getByRole('button', {
    name: 'Toggle explorer sidebar',
  });

  expect(fileBtn).toBeVisible();
  expect(sidebarBtn).toHaveAttribute('aria-pressed', 'true');

  await user.click(sidebarBtn);
  expect(fileBtn).not.toBeVisible();
  expect(sidebarBtn).toHaveAttribute('aria-pressed', 'false');

  await user.click(sidebarBtn);
  expect(fileBtn).toBeVisible();
  expect(sidebarBtn).toHaveAttribute('aria-pressed', 'true');
});

test('navigate groups in explorer', async () => {
  const { selectExplorerNode } = await renderApp();

  const groupBtn = await screen.findByRole('treeitem', { name: 'entities' });
  expect(groupBtn).toHaveAttribute('aria-selected', 'false');
  expect(groupBtn).toHaveAttribute('aria-expanded', 'false');

  // Expand `entities` group
  await selectExplorerNode('entities');

  expect(groupBtn).toHaveAttribute('aria-selected', 'true');
  expect(groupBtn).toHaveAttribute('aria-expanded', 'true');

  const childGroupBtn = await screen.findByRole('treeitem', {
    name: 'empty_group',
  });
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
    screen.queryByRole('treeitem', { name: 'empty_group' })
  ).not.toBeInTheDocument();
  expect(groupBtn).toHaveAttribute('aria-selected', 'true');
  expect(groupBtn).toHaveAttribute('aria-expanded', 'false');
});

test('show spinner when group metadata is slow to fetch', async () => {
  await renderApp({
    initialPath: '/resilience/slow_metadata',
    withFakeTimers: true,
  });

  await expect(screen.findByText(/Loading/)).resolves.toBeVisible();
  expect(screen.getByLabelText(/Loading group metadata/)).toBeVisible();

  jest.runAllTimers(); // resolve slow fetch right away
  await waitFor(() => {
    expect(
      screen.queryByLabelText(/Loading group metadata/)
    ).not.toBeInTheDocument();
  });
});
