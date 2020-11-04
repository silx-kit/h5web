import { fireEvent, screen } from '@testing-library/react';
import {
  findVisSelector,
  queryVisSelector,
  renderApp,
  selectExplorerNode,
} from '../test-utils';

describe('MetadataViewer', () => {
  test('switch between "display" and "inspect" modes', async () => {
    renderApp();

    const inspectBtn = await screen.findByRole('tab', { name: 'Inspect' });
    const displayBtn = screen.getByRole('tab', { name: 'Display' });

    // Switch to "inspect" mode
    fireEvent.click(inspectBtn);

    expect(queryVisSelector()).not.toBeInTheDocument();
    expect(screen.getByRole('row', { name: /Entity ID/u })).toBeVisible();

    // Switch back to "display" mode
    fireEvent.click(displayBtn);

    expect(await findVisSelector()).toBeVisible();
    expect(
      screen.queryByRole('row', { name: /Entity ID/u })
    ).not.toBeInTheDocument();
  });

  test('inspect scalar dataset', async () => {
    renderApp();
    await selectExplorerNode('entities/scalar_int');

    // Switch to "inspect" mode
    fireEvent.click(screen.getByRole('tab', { name: 'Inspect' }));
    expect(queryVisSelector()).not.toBeInTheDocument();

    const shapeRow = screen.getByRole('row', { name: /Shape/u });
    expect(shapeRow).toBeVisible();
  });
});
