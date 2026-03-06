import { expect, test, vi } from 'vitest';
import { page } from 'vitest/browser';

import { getExplorerItem, renderApp } from '../test-utils';

test('toggle sidebar', async () => {
  await renderApp();

  // Open by default
  const toggleBtn = page.getByRole('button', { name: 'Toggle sidebar' });
  expect(toggleBtn).toHaveAttribute('aria-pressed', 'true');
  expect(getExplorerItem('source.h5')).toBeVisible();

  // Hide
  await toggleBtn.click();
  expect(toggleBtn).toHaveAttribute('aria-pressed', 'false');
  expect(
    page.getByRole('treeitem', { name: 'source.h5' }),
  ).not.toBeInTheDocument();

  // Show
  await toggleBtn.click();
  expect(toggleBtn).toHaveAttribute('aria-pressed', 'true');
  expect(getExplorerItem('source.h5')).toBeVisible();
});

test('switch between "display" and "inspect" modes', async () => {
  await renderApp();

  // Switch to "inspect" mode
  await page.getByRole('tab', { name: 'Inspect' }).click();
  expect(page.getByRole('row', { name: /^Path/ })).toBeVisible();

  // Switch back to "display" mode
  await page.getByRole('tab', { name: 'Display' }).click();
  expect(page.getByRole('row', { name: /^Path/ })).not.toBeInTheDocument();
});

test('navigate with breadcrumbs', async () => {
  const { selectExplorerNode } = await renderApp();
  expect(page.getByRole('heading', { name: 'source.h5' })).toBeVisible();

  // Select group
  await selectExplorerNode('entities');
  expect(page.getByRole('heading', { name: 'entities' })).toBeVisible(); // no root crumb when sidebar is open

  // Select child
  await selectExplorerNode('empty_dataset');
  expect(
    page.getByRole('heading', { name: 'entities / empty_dataset' }),
  ).toBeVisible();

  // Hide sidebar to show root crumb
  const toggleBtn = page.getByRole('button', { name: 'Toggle sidebar' });
  await toggleBtn.click();
  expect(
    page.getByRole('heading', {
      name: 'source.h5 / entities / empty_dataset',
    }),
  ).toBeVisible();

  // Select parent crumb
  await page.getByRole('button', { name: 'entities' }).click();
  expect(
    page.getByRole('heading', { name: 'source.h5 / entities' }),
  ).toBeVisible();

  // Select root crumb
  await page.getByRole('button', { name: 'source.h5' }).click();
  expect(page.getByRole('heading', { name: 'source.h5' })).toBeVisible();
});

test('copy path to clipboard', async () => {
  await renderApp({ initialPath: '/entities/empty_dataset' });

  const lastCrumb = page.getByRole('button', {
    name: 'empty_dataset (copy path)',
  });
  expect(lastCrumb).toBeVisible();

  const mock = vi.spyOn(navigator.clipboard, 'writeText');
  await lastCrumb.click();
  expect(mock).toHaveBeenCalledWith('/entities/empty_dataset');
});
