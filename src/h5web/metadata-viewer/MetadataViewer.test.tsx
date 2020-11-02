import { fireEvent, screen } from '@testing-library/react';
import { renderApp } from '../test-utils';

describe('MetadataViewer', () => {
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
});
