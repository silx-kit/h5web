import { fireEvent, screen } from '@testing-library/react';
import { DOMAIN, renderApp } from '../test-utils';

describe('Explorer', () => {
  test('select root group by default', async () => {
    renderApp();

    const title = await screen.findByRole('heading', { name: DOMAIN });
    expect(title).toBeVisible();

    const domainBtn = screen.getByRole('treeitem', { name: DOMAIN });
    expect(domainBtn).toBeVisible();
    expect(domainBtn).toHaveAttribute('aria-selected', 'true');
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
});
