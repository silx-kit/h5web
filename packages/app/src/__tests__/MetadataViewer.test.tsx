import { expect, test } from 'vitest';
import { page } from 'vitest/browser';

import { mockConsoleMethod, mockDelay, renderApp } from '../test-utils';

test('inspect group', async () => {
  await renderApp('/entities');
  await page.getByRole('tab', { name: 'Inspect' }).click();

  const column = page.getByRole('columnheader', { name: /group/ });
  const nameRow = page.getByRole('row', { name: /^Name/ });
  const pathRow = page.getByRole('row', { name: /^Path/ });

  expect(column).toBeVisible();
  expect(nameRow).toHaveTextContent(/entities$/);
  expect(pathRow).toHaveTextContent(/\/entities$/);
});

test('inspect scalar datasets', async () => {
  const { selectExplorerNode } = await renderApp('/entities/scalar_num');
  await page.getByRole('tab', { name: 'Inspect' }).click();

  const column = page.getByRole('columnheader', { name: /dataset/ });
  const nameRow = page.getByRole('row', { name: /^Name/ });
  const pathRow = page.getByRole('row', { name: /^Path/ });
  const typeRow = page.getByRole('row', { name: /^Type/ });
  const shapeRow = page.getByRole('row', { name: /^Shape/ });
  const attrRow = page.getByRole('row', { name: /^attr/ });

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
  await renderApp('/nD_datasets/threeD');
  await page.getByRole('tab', { name: 'Inspect' }).click();

  const shapeRow = page.getByRole('row', { name: /^Shape/ });
  expect(shapeRow).toHaveTextContent(/9 x 20 x 41 = 7380$/);

  const chunkRow = page.getByRole('row', { name: /^Chunk shape/ });
  expect(chunkRow).toHaveTextContent(/1 x 20 x 41 = 820$/);

  const filterRow = page.getByRole('row', { name: /^12345/ });
  expect(filterRow).toHaveTextContent(/Some filter$/);
});

test('inspect empty dataset', async () => {
  await renderApp('/entities/empty_dataset');
  await page.getByRole('tab', { name: 'Inspect' }).click();

  const shapeRow = page.getByRole('row', { name: /^Shape/ });
  const typeRow = page.getByRole('row', { name: /^Type/ });
  expect(shapeRow).toHaveTextContent(/None$/);
  expect(typeRow).toHaveTextContent(/Unknown$/);
});

test('inspect datatype', async () => {
  await renderApp('/entities/datatype');
  await page.getByRole('tab', { name: 'Inspect' }).click();

  const column = page.getByRole('columnheader', { name: 'datatype' });
  const nameRow = page.getByRole('row', { name: /^Name/ });
  const pathRow = page.getByRole('row', { name: /^Path/ });
  const typeRow = page.getByRole('row', { name: /^Type/ });

  expect(column).toBeVisible();
  expect(nameRow).toHaveTextContent(/datatype$/);
  expect(pathRow).toHaveTextContent(/\/entities\/datatype$/);
  expect(typeRow).toHaveTextContent(/Compound$/);
});

test('inspect unresolved soft link', async () => {
  await renderApp('/entities/unresolved_soft_link');
  await page.getByRole('tab', { name: 'Inspect' }).click();

  const column = page.getByRole('columnheader', { name: 'Entity' });
  const nameRow = page.getByRole('row', { name: /^Name/ });
  const pathRow = page.getByRole('row', { name: /^Path/ });
  const linkRow = page.getByRole('row', { name: /^Soft link/ });

  expect(column).toBeVisible();
  expect(nameRow).toHaveTextContent(/unresolved_soft_link$/);
  expect(pathRow).toHaveTextContent(/\/entities\/unresolved_soft_link$/);
  expect(linkRow).toHaveTextContent(/\/foo$/);
});

test('inspect unresolved external link', async () => {
  await renderApp('/entities/unresolved_external_link');
  await page.getByRole('tab', { name: 'Inspect' }).click();

  const column = page.getByRole('columnheader', { name: 'Entity' });
  const linkRow = page.getByRole('row', { name: /^External link/ });
  expect(column).toBeVisible();
  expect(linkRow).toHaveTextContent(/my_file.h5:entry_000\/dataset$/);
});

test('follow path attributes', async () => {
  const { selectNexusExplorerNode } = await renderApp();
  await page.getByRole('tab', { name: 'Inspect' }).click();

  // Follow relative `default` attribute
  await page.getByRole('button', { name: 'Inspect nexus_entry' }).click();

  const nxEntry = page.getByRole('treeitem', { name: /^nexus_entry / });
  expect(nxEntry).toHaveAttribute('aria-selected', 'true');
  expect(nxEntry).toHaveAttribute('aria-expanded', 'true');

  await selectNexusExplorerNode('nx_process');
  await selectNexusExplorerNode('absolute_default_path');

  // Follow absolute `default` attribute
  await page
    .getByRole('button', { name: 'Inspect /nexus_entry/nx_process/nx_data' })
    .click();

  const nxData = page.getByRole('treeitem', { name: /nx_data/ });
  expect(nxData).toHaveAttribute('aria-selected', 'true');
  expect(nxData).toHaveAttribute('aria-expanded', 'true');
});

test("show error when attribute values can't be fetched", async () => {
  const runAll = mockDelay();
  const errorSpy = mockConsoleMethod('error');

  await renderApp({
    initialPath: '/resilience/error_value',
    waitForLoaders: false,
  });
  runAll();

  await page.getByRole('tab', { name: 'Inspect' }).click();
  expect(page.getByText('some error')).toBeVisible();
  errorSpy.mockRestore();
});
