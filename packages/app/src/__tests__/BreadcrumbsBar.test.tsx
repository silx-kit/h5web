import { screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';

import { getExplorerItem, renderApp } from '../test-utils';

test('toggle sidebar', async () => {
  const { user } = await renderApp();

  // Open by default
  const toggleBtn = screen.getByRole('button', { name: 'Toggle sidebar' });
  expect(toggleBtn).toBePressed();
  expect(getExplorerItem('source.h5')).toBeVisible();

  // Hide
  await user.click(toggleBtn);
  expect(toggleBtn).not.toBePressed();
  expect(screen.queryByRole('treeitem', { name: 'source.h5' })).toBeNull();

  // Show
  await user.click(toggleBtn);
  expect(toggleBtn).toBePressed();
  expect(getExplorerItem('source.h5')).toBeVisible();
});

test('switch between "display" and "inspect" modes', async () => {
  const { user } = await renderApp();

  // Switch to "inspect" mode
  await user.click(screen.getByRole('tab', { name: 'Inspect' }));
  expect(screen.getByRole('row', { name: /^Path/ })).toBeVisible();

  // Switch back to "display" mode
  await user.click(screen.getByRole('tab', { name: 'Display' }));
  expect(screen.queryByRole('row', { name: /^Path/ })).not.toBeInTheDocument();
});

test('navigate with breadcrumbs', async () => {
  const { user, selectExplorerNode } = await renderApp();
  expect(screen.getByRole('heading', { name: 'source.h5' })).toBeVisible();

  // Select group
  await selectExplorerNode('entities');
  expect(screen.getByRole('heading', { name: 'entities' })).toBeVisible(); // no root crumb when sidebar is open

  // Select child
  await selectExplorerNode('empty_dataset');
  expect(
    screen.getByRole('heading', { name: 'entities / empty_dataset' }),
  ).toBeVisible();

  // Hide sidebar to show root crumb
  const toggleBtn = screen.getByRole('button', { name: 'Toggle sidebar' });
  await user.click(toggleBtn);
  expect(
    screen.getByRole('heading', {
      name: 'source.h5 / entities / empty_dataset',
    }),
  ).toBeVisible();

  // Select parent crumb
  await user.click(screen.getByRole('button', { name: 'entities' }));
  expect(
    screen.getByRole('heading', { name: 'source.h5 / entities' }),
  ).toBeVisible();

  // Select root crumb
  await user.click(screen.getByRole('button', { name: 'source.h5' }));
  expect(screen.getByRole('heading', { name: 'source.h5' })).toBeVisible();
});

test('copy path to clipboard', async () => {
  const { user } = await renderApp({ initialPath: '/entities/empty_dataset' });

  const lastCrumb = screen.getByRole('button', {
    name: 'empty_dataset (copy path)',
  });
  expect(lastCrumb).toBeVisible();

  const mock = vi.spyOn(navigator.clipboard, 'writeText');
  await user.click(lastCrumb);
  expect(mock).toHaveBeenCalledWith('/entities/empty_dataset');
});
