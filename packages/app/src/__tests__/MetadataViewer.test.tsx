import { screen } from '@testing-library/react';

import { renderApp } from '../test-utils';

test('switch between "display" and "inspect" modes', async () => {
  const { user } = await renderApp();

  // Switch to "inspect" mode
  await user.click(screen.getByRole('tab', { name: 'Inspect' }));
  expect(screen.getByRole('row', { name: /^Path/ })).toBeVisible();

  // Switch back to "display" mode
  await user.click(screen.getByRole('tab', { name: 'Display' }));
  expect(screen.queryByRole('row', { name: /^Path/ })).not.toBeInTheDocument();
});

test('inspect group', async () => {
  const { user } = await renderApp('/entities');
  await user.click(screen.getByRole('tab', { name: 'Inspect' }));

  const column = screen.getByRole('columnheader', { name: /^Group/ });
  const nameRow = screen.getByRole('row', { name: /^Name/ });
  const pathRow = screen.getByRole('row', { name: /^Path/ });

  expect(column).toBeVisible();
  expect(nameRow).toHaveTextContent(/entities/);
  expect(pathRow).toHaveTextContent(/\/entities/);
});

test('inspect scalar dataset', async () => {
  const { user } = await renderApp('/entities/scalar_int');
  await user.click(screen.getByRole('tab', { name: 'Inspect' }));

  const column = screen.getByRole('columnheader', { name: /Dataset/ });
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
  const { user } = await renderApp('/nD_datasets/threeD');
  await user.click(screen.getByRole('tab', { name: 'Inspect' }));

  const shapeRow = screen.getByRole('row', { name: /^Shape/ });
  expect(shapeRow).toHaveTextContent(/9 x 20 x 41 = 7380/);
});

test('inspect empty dataset', async () => {
  const { user } = await renderApp('/entities/empty_dataset');
  await user.click(screen.getByRole('tab', { name: 'Inspect' }));

  const shapeRow = screen.getByRole('row', { name: /^Shape/ });
  const typeRow = screen.getByRole('row', { name: /^Type/ });
  expect(shapeRow).toHaveTextContent(/None/);
  expect(typeRow).toHaveTextContent(/Integer, 32-bit, little-endian/);
});

test('inspect datatype', async () => {
  const { user } = await renderApp('/entities/datatype');
  await user.click(screen.getByRole('tab', { name: 'Inspect' }));

  const column = screen.getByRole('columnheader', { name: /Datatype/ });
  const nameRow = screen.getByRole('row', { name: /^Name/ });
  const pathRow = screen.getByRole('row', { name: /^Path/ });
  const typeRow = screen.getByRole('row', { name: /^Type/ });

  expect(column).toBeVisible();
  expect(nameRow).toHaveTextContent(/datatype/);
  expect(pathRow).toHaveTextContent(/\/entities\/datatype/);
  expect(typeRow).toHaveTextContent(/Compound/);
});

test('inspect unresolved soft link', async () => {
  const { user } = await renderApp('/entities/unresolved_soft_link');
  await user.click(screen.getByRole('tab', { name: 'Inspect' }));

  const column = screen.getByRole('columnheader', { name: /Entity/ });
  const nameRow = screen.getByRole('row', { name: /^Name/ });
  const pathRow = screen.getByRole('row', { name: /^Path/ });
  const linkRow = screen.getByRole('row', { name: /^Soft link/ });

  expect(column).toBeVisible();
  expect(nameRow).toHaveTextContent(/unresolved_soft_link/);
  expect(pathRow).toHaveTextContent(/\/entities\/unresolved_soft_link/);
  expect(linkRow).toHaveTextContent(/\/foo/);
});

test('inspect unresolved external link', async () => {
  const { user } = await renderApp('/entities/unresolved_external_link');
  await user.click(screen.getByRole('tab', { name: 'Inspect' }));

  const column = screen.getByRole('columnheader', { name: /Entity/ });
  const linkRow = screen.getByRole('row', { name: /^External link/ });
  expect(column).toBeVisible();
  expect(linkRow).toHaveTextContent(/my_file.h5:entry_000\/dataset/);
});

test('follow path attributes', async () => {
  const { user, selectExplorerNode } = await renderApp();
  await user.click(screen.getByRole('tab', { name: 'Inspect' }));

  // Follow relative `default` attribute
  await user.click(screen.getByRole('button', { name: 'Inspect nexus_entry' }));

  const nxEntry = screen.getByRole('treeitem', { name: /^nexus_entry / });
  expect(nxEntry).toHaveAttribute('aria-selected', 'true');
  expect(nxEntry).toHaveAttribute('aria-expanded', 'true');

  await selectExplorerNode('nx_process');
  await selectExplorerNode('absolute_default_path');

  // Follow absolute `default` attribute
  await user.click(
    await screen.findByRole('button', {
      name: 'Inspect /nexus_entry/nx_process/nx_data',
    })
  );

  const nxData = screen.getByRole('treeitem', { name: /nx_data/ });
  expect(nxData).toHaveAttribute('aria-selected', 'true');
  expect(nxData).toHaveAttribute('aria-expanded', 'true');
});
