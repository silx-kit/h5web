import { screen } from '@testing-library/react';
import { expect, test } from 'vitest';

import { mockConsoleMethod, renderApp } from '../test-utils';

test('inspect group', async () => {
  const { user } = await renderApp('/entities');
  await user.click(screen.getByRole('tab', { name: 'Inspect' }));

  const column = screen.getByRole('columnheader', { name: /group/ });
  const nameRow = screen.getByRole('row', { name: /^Name/ });
  const pathRow = screen.getByRole('row', { name: /^Path/ });

  expect(column).toBeVisible();
  expect(nameRow).toHaveTextContent(/entities$/);
  expect(pathRow).toHaveTextContent(/\/entities$/);
});

test('inspect scalar datasets', async () => {
  const { user, selectExplorerNode } = await renderApp('/entities/scalar_num');
  await user.click(screen.getByRole('tab', { name: 'Inspect' }));

  const column = screen.getByRole('columnheader', { name: /dataset/ });
  const nameRow = screen.getByRole('row', { name: /^Name/ });
  const pathRow = screen.getByRole('row', { name: /^Path/ });
  const typeRow = screen.getByRole('row', { name: /^Type/ });
  const shapeRow = screen.getByRole('row', { name: /^Shape/ });
  const attrRow = screen.getByRole('row', { name: /^attr/ });

  expect(column).toBeVisible();
  expect(nameRow).toHaveTextContent(/scalar_num$/);
  expect(pathRow).toHaveTextContent(/\/entities\/scalar_num$/);
  expect(typeRow).toHaveTextContent(/Float, 64-bit, little-endian$/);
  expect(shapeRow).toHaveTextContent(/Scalar$/);
  expect(attrRow).toHaveTextContent(/0$/);

  await selectExplorerNode('scalar_bigint');
  expect(typeRow).toHaveTextContent(
    /Integer \(signed\), 64-bit, little-endian$/,
  );
  expect(attrRow).toHaveTextContent(/"9007199254740992n"$/);

  await selectExplorerNode('scalar_str');
  expect(typeRow).toHaveTextContent(/ASCII string, variable length$/);
  expect(attrRow).toHaveTextContent(/"foo"$/);

  await selectExplorerNode('scalar_cplx');
  expect(typeRow).toHaveTextContent(/Complex$/);
  expect(attrRow).toHaveTextContent(/1 \+ 5 i$/);
});

test('inspect array dataset', async () => {
  const { user } = await renderApp('/nD_datasets/threeD');
  await user.click(screen.getByRole('tab', { name: 'Inspect' }));

  const shapeRow = screen.getByRole('row', { name: /^Shape/ });
  expect(shapeRow).toHaveTextContent(/9 x 20 x 41 = 7380$/);

  const chunkRow = screen.getByRole('row', { name: /^Chunk shape/ });
  expect(chunkRow).toHaveTextContent(/1 x 20 x 41 = 820$/);

  const filterRow = screen.getByRole('row', { name: /^12345/ });
  expect(filterRow).toHaveTextContent(/Some filter$/);
});

test('inspect empty dataset', async () => {
  const { user } = await renderApp('/entities/empty_dataset');
  await user.click(screen.getByRole('tab', { name: 'Inspect' }));

  const shapeRow = screen.getByRole('row', { name: /^Shape/ });
  const typeRow = screen.getByRole('row', { name: /^Type/ });
  expect(shapeRow).toHaveTextContent(/None$/);
  expect(typeRow).toHaveTextContent(/Unknown$/);
});

test('inspect datatype', async () => {
  const { user } = await renderApp('/entities/datatype');
  await user.click(screen.getByRole('tab', { name: 'Inspect' }));

  const column = screen.getByRole('columnheader', { name: 'datatype' });
  const nameRow = screen.getByRole('row', { name: /^Name/ });
  const pathRow = screen.getByRole('row', { name: /^Path/ });
  const typeRow = screen.getByRole('row', { name: /^Type/ });

  expect(column).toBeVisible();
  expect(nameRow).toHaveTextContent(/datatype$/);
  expect(pathRow).toHaveTextContent(/\/entities\/datatype$/);
  expect(typeRow).toHaveTextContent(/Compound$/);
});

test('inspect unresolved soft link', async () => {
  const { user } = await renderApp('/entities/unresolved_soft_link');
  await user.click(screen.getByRole('tab', { name: 'Inspect' }));

  const column = screen.getByRole('columnheader', { name: 'Entity' });
  const nameRow = screen.getByRole('row', { name: /^Name/ });
  const pathRow = screen.getByRole('row', { name: /^Path/ });
  const linkRow = screen.getByRole('row', { name: /^Soft link/ });

  expect(column).toBeVisible();
  expect(nameRow).toHaveTextContent(/unresolved_soft_link$/);
  expect(pathRow).toHaveTextContent(/\/entities\/unresolved_soft_link$/);
  expect(linkRow).toHaveTextContent(/\/foo$/);
});

test('inspect unresolved external link', async () => {
  const { user } = await renderApp('/entities/unresolved_external_link');
  await user.click(screen.getByRole('tab', { name: 'Inspect' }));

  const column = screen.getByRole('columnheader', { name: 'Entity' });
  const linkRow = screen.getByRole('row', { name: /^External link/ });
  expect(column).toBeVisible();
  expect(linkRow).toHaveTextContent(/my_file.h5:entry_000\/dataset$/);
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
    }),
  );

  const nxData = screen.getByRole('treeitem', { name: /nx_data/ });
  expect(nxData).toHaveAttribute('aria-selected', 'true');
  expect(nxData).toHaveAttribute('aria-expanded', 'true');
});

test("show error when attribute values can't be fetched", async () => {
  const errorSpy = mockConsoleMethod('error');
  const { user } = await renderApp('/resilience/error_value');

  await user.click(screen.getByRole('tab', { name: 'Inspect' }));
  expect(screen.getByText('some error')).toBeVisible();
  errorSpy.mockRestore();
});
