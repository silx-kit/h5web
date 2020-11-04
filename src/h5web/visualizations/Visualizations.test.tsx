import { fireEvent, screen } from '@testing-library/react';
import { renderApp } from '../test-utils';

describe('Visualizer', () => {
  test('visualise scalar dataset', async () => {
    renderApp();

    fireEvent.click(await screen.findByRole('treeitem', { name: 'entities' }));
    const datasetBtn = screen.getByRole('treeitem', { name: 'scalar_int' });
    expect(datasetBtn).toBeVisible();

    fireEvent.click(datasetBtn);
    expect(datasetBtn).toHaveAttribute('aria-selected', 'true');
    expect(datasetBtn).not.toHaveAttribute('aria-expanded'); // a dataset cannot be expanded

    const scalarTab = await screen.findByRole('tab', { name: 'Scalar' });
    expect(scalarTab).toBeVisible();
    expect(scalarTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('0')).toBeVisible();

    fireEvent.click(screen.getByRole('treeitem', { name: 'scalar_str' }));
    expect(await screen.findByText('foo')).toBeVisible();
  });
});
