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
    expect(screen.getByRole('row', { name: /ID/u })).toBeVisible();

    // Switch back to "display" mode
    fireEvent.click(displayBtn);

    expect(await findVisSelector()).toBeVisible();
    expect(screen.queryByRole('row', { name: /ID/u })).not.toBeInTheDocument();
  });

  test('inspect group', async () => {
    renderApp();
    fireEvent.click(await screen.findByRole('tab', { name: 'Inspect' }));
    await selectExplorerNode('entities');

    const column = await screen.findByRole('columnheader', { name: /Group/u });
    const idRow = screen.getByRole('row', { name: /ID/u });
    const nameRow = screen.getByRole('row', { name: /Name/u });
    const pathRow = screen.getByRole('row', { name: /Path/u });

    expect(column).toBeVisible();
    expect(idRow).toHaveTextContent(/entities/u);
    expect(nameRow).toHaveTextContent(/entities/u);
    expect(pathRow).toHaveTextContent(/\/entities/u);
  });

  test('inspect scalar dataset', async () => {
    renderApp();
    fireEvent.click(await screen.findByRole('tab', { name: 'Inspect' }));
    await selectExplorerNode('entities/scalar_int');

    const column = await screen.findByRole('columnheader', {
      name: /Dataset/u,
    });
    const idRow = screen.getByRole('row', { name: /ID/u });
    const nameRow = screen.getByRole('row', { name: /Name/u });
    const pathRow = screen.getByRole('row', { name: /Path/u });
    const shapeRow = screen.getByRole('row', { name: /Shape/u });
    const typeRow = screen.getByRole('row', { name: /Type/u });

    expect(column).toBeVisible();
    expect(idRow).toHaveTextContent(/scalar_int/u);
    expect(nameRow).toHaveTextContent(/scalar_int/u);
    expect(pathRow).toHaveTextContent(/\/entities\/scalar_int/u);
    expect(shapeRow).toHaveTextContent(/H5S_SCALAR/u);
    expect(typeRow).toHaveTextContent(/H5T_INTEGER/u);
  });

  test('inspect simple dataset', async () => {
    renderApp();
    fireEvent.click(await screen.findByRole('tab', { name: 'Inspect' }));
    await selectExplorerNode('nD_datasets/threeD');

    const shapeRow = await screen.findByRole('row', { name: /Shape/u });
    expect(shapeRow).toHaveTextContent(/9 x 20 x 41 = 7380/u);
  });

  test('inspect datatype', async () => {
    renderApp();
    fireEvent.click(await screen.findByRole('tab', { name: 'Inspect' }));
    await selectExplorerNode('entities/datatype');

    const column = await screen.findByRole('columnheader', {
      name: /Datatype/u,
    });
    const idRow = screen.getByRole('row', { name: /ID/u });
    const nameRow = screen.getByRole('row', { name: /Name/u });
    const pathRow = screen.getByRole('row', { name: /Path/u });
    const typeRow = screen.getByRole('row', { name: /Type/u });

    expect(column).toBeVisible();
    expect(idRow).toHaveTextContent(/datatype/u);
    expect(nameRow).toHaveTextContent(/datatype/u);
    expect(pathRow).toHaveTextContent(/\/entities\/datatype/u);
    expect(typeRow).toHaveTextContent(/H5T_COMPOUND/u);
  });

  test('inspect external link', async () => {
    renderApp();
    fireEvent.click(await screen.findByRole('tab', { name: 'Inspect' }));
    await selectExplorerNode('entities/external_link');

    const column = await screen.findByRole('columnheader', { name: /Link/u });
    const nameRow = screen.getByRole('row', { name: /Name/u });
    const pathRow = screen.getByRole('row', { name: /^Path/u });
    const fileRow = screen.getByRole('row', { name: /File/u });
    const h5pathRow = screen.getByRole('row', { name: /H5Path/u });

    expect(column).toBeVisible();
    expect(nameRow).toHaveTextContent(/external_link/u);
    expect(pathRow).toHaveTextContent(/\/entities\/external_link/u);
    expect(fileRow).toHaveTextContent(/my_file/u);
    expect(h5pathRow).toHaveTextContent(/entry_000\/dataset/u);
  });
});
