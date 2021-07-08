import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  findVisSelector,
  queryVisSelector,
  renderApp,
  selectExplorerNode,
} from '../test-utils';

test('switch between "display" and "inspect" modes', async () => {
  await renderApp();

  const inspectBtn = await screen.findByRole('tab', { name: 'Inspect' });
  const displayBtn = screen.getByRole('tab', { name: 'Display' });

  // Switch to "inspect" mode
  userEvent.click(inspectBtn);

  expect(queryVisSelector()).not.toBeInTheDocument();
  expect(screen.getByRole('row', { name: /^Path/ })).toBeVisible();

  // Switch back to "display" mode
  userEvent.click(displayBtn);

  expect(await findVisSelector()).toBeVisible();
  expect(screen.queryByRole('row', { name: /^Path/ })).not.toBeInTheDocument();
});

test('inspect group', async () => {
  await renderApp();
  userEvent.click(await screen.findByRole('tab', { name: 'Inspect' }));
  await selectExplorerNode('entities');

  const column = await screen.findByRole('columnheader', { name: /^Group/ });
  const nameRow = screen.getByRole('row', { name: /^Name/ });
  const pathRow = screen.getByRole('row', { name: /^Path/ });

  expect(column).toBeVisible();
  expect(nameRow).toHaveTextContent(/entities/);
  expect(pathRow).toHaveTextContent(/\/entities/);
});

test('inspect scalar dataset', async () => {
  await renderApp();
  userEvent.click(await screen.findByRole('tab', { name: 'Inspect' }));
  await selectExplorerNode('entities/scalar_int');

  const column = await screen.findByRole('columnheader', {
    name: /Dataset/,
  });
  const nameRow = screen.getByRole('row', { name: /^Name/ });
  const pathRow = screen.getByRole('row', { name: /^Path/ });
  const shapeRow = screen.getByRole('row', { name: /^Shape/ });
  const typeRow = screen.getByRole('row', { name: /^Type/ });

  expect(column).toBeVisible();
  expect(nameRow).toHaveTextContent(/scalar_int/);
  expect(pathRow).toHaveTextContent(/\/entities\/scalar_int/);
  expect(shapeRow).toHaveTextContent(/Scalar/);
  expect(typeRow).toHaveTextContent(/Integer, 32-bit, little-endian/);
});

test('inspect array dataset', async () => {
  await renderApp();
  userEvent.click(await screen.findByRole('tab', { name: 'Inspect' }));
  await selectExplorerNode('nD_datasets/threeD');

  const shapeRow = await screen.findByRole('row', { name: /^Shape/ });
  expect(shapeRow).toHaveTextContent(/9 x 20 x 41 = 7380/);
});

test('inspect empty dataset', async () => {
  await renderApp();
  userEvent.click(await screen.findByRole('tab', { name: 'Inspect' }));
  await selectExplorerNode('entities/empty_dataset');

  const shapeRow = await screen.findByRole('row', { name: /^Shape/ });
  const typeRow = screen.getByRole('row', { name: /^Type/ });

  expect(shapeRow).toHaveTextContent(/None/);
  expect(typeRow).toHaveTextContent(/Integer, 32-bit, little-endian/);
});

test('inspect datatype', async () => {
  await renderApp();
  userEvent.click(await screen.findByRole('tab', { name: 'Inspect' }));
  await selectExplorerNode('entities/datatype');

  const column = await screen.findByRole('columnheader', {
    name: /Datatype/,
  });
  const nameRow = screen.getByRole('row', { name: /^Name/ });
  const pathRow = screen.getByRole('row', { name: /^Path/ });
  const typeRow = screen.getByRole('row', { name: /^Type/ });

  expect(column).toBeVisible();
  expect(nameRow).toHaveTextContent(/datatype/);
  expect(pathRow).toHaveTextContent(/\/entities\/datatype/);
  expect(typeRow).toHaveTextContent(/Compound/);
});

test('inspect unresolved soft link', async () => {
  await renderApp();
  userEvent.click(await screen.findByRole('tab', { name: 'Inspect' }));
  await selectExplorerNode('entities/unresolved_soft_link');

  const column = await screen.findByRole('columnheader', { name: /Entity/ });
  const nameRow = screen.getByRole('row', { name: /^Name/ });
  const pathRow = screen.getByRole('row', { name: /^Path/ });
  const linkRow = screen.getByRole('row', { name: /^Soft link/ });

  expect(column).toBeVisible();
  expect(nameRow).toHaveTextContent(/unresolved_soft_link/);
  expect(pathRow).toHaveTextContent(/\/entities\/unresolved_soft_link/);
  expect(linkRow).toHaveTextContent(/\/foo/);
});

test('inspect unresolved external link', async () => {
  await renderApp();
  userEvent.click(await screen.findByRole('tab', { name: 'Inspect' }));
  await selectExplorerNode('entities/unresolved_external_link');

  const column = await screen.findByRole('columnheader', { name: /Entity/ });
  const linkRow = screen.getByRole('row', { name: /^External link/ });

  expect(column).toBeVisible();
  expect(linkRow).toHaveTextContent(/my_file.h5:entry_000\/dataset/);
});

test('follow path attributes', async () => {
  await renderApp();
  userEvent.click(await screen.findByRole('tab', { name: 'Inspect' }));

  userEvent.click(
    await screen.findByRole('button', { name: 'Inspect nexus_entry' })
  );

  const nxEntry = await screen.findByRole('treeitem', { name: /nexus_entry/ });
  expect(nxEntry).toHaveAttribute('aria-selected', 'true');
  expect(nxEntry).toHaveAttribute('aria-expanded', 'true');

  await selectExplorerNode('nx_process/absolute_default_path');

  userEvent.click(
    await screen.findByRole('button', {
      name: 'Inspect /nexus_entry/nx_process/nx_data',
    })
  );

  const nxData = await screen.findByRole('treeitem', { name: /nx_data/ });
  expect(nxData).toHaveAttribute('aria-selected', 'true');
  expect(nxData).toHaveAttribute('aria-expanded', 'true');
});
