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
  expect(nameRow).toMatchTextContent(/entities$/);
  expect(pathRow).toMatchTextContent(/\/entities$/);
});

test('inspect scalar datasets', async () => {
  const { selectExplorerNode } = await renderApp('/scalars/number');
  await page.getByRole('tab', { name: 'Inspect' }).click();

  const column = page.getByRole('columnheader', { name: /dataset/ });
  const nameRow = page.getByRole('row', { name: /^Name/ });
  const pathRow = page.getByRole('row', { name: /^Path/ });
  const typeRow = page.getByRole('row', { name: /^Type/ });
  const shapeRow = page.getByRole('row', { name: /^Shape/ });
  const attrRow = page.getByRole('row', { name: /^attr/ });

  expect(column).toBeVisible();
  expect(nameRow).toMatchTextContent(/number$/);
  expect(pathRow).toMatchTextContent(/\/scalars\/number$/);
  expect(typeRow).toMatchTextContent(/Float, 64-bit, little-endian$/);
  expect(shapeRow).toMatchTextContent(/Scalar$/);
  await expect.element(attrRow).toMatchTextContent(/0$/);

  await selectExplorerNode('bigint');
  expect(typeRow).toMatchTextContent(
    /Integer \(signed\), 64-bit, little-endian$/,
  );
  expect(attrRow).toMatchTextContent(/"9007199254740992n"$/);

  await selectExplorerNode('string');
  expect(typeRow).toMatchTextContent(/ASCII string, variable length$/);
  expect(attrRow).toMatchTextContent(/"foo"$/);

  await selectExplorerNode('complex');
  expect(typeRow).toMatchTextContent(/Complex$/);
  expect(attrRow).toMatchTextContent(/1 \+ 5 i$/);
});

test('inspect array dataset', async () => {
  await renderApp('/arrays/threeD');
  await page.getByRole('tab', { name: 'Inspect' }).click();

  const shapeRow = page.getByRole('row', { name: /^Shape/ });
  expect(shapeRow).toMatchTextContent(/9 x 20 x 41 = 7380$/);

  const chunkRow = page.getByRole('row', { name: /^Chunk shape/ });
  expect(chunkRow).toMatchTextContent(/1 x 20 x 41 = 820$/);

  const filterRow = page.getByRole('row', { name: /^12345/ });
  expect(filterRow).toMatchTextContent(/Some filter$/);
});

test('inspect empty dataset', async () => {
  await renderApp('/entities/dataset_empty');
  await page.getByRole('tab', { name: 'Inspect' }).click();

  const shapeRow = page.getByRole('row', { name: /^Shape/ });
  const typeRow = page.getByRole('row', { name: /^Type/ });
  expect(shapeRow).toMatchTextContent(/None$/);
  expect(typeRow).toMatchTextContent(/Unknown$/);
});

test('inspect datatype', async () => {
  await renderApp('/entities/datatype');
  await page.getByRole('tab', { name: 'Inspect' }).click();

  const column = page.getByRole('columnheader', { name: 'datatype' });
  const nameRow = page.getByRole('row', { name: /^Name/ });
  const pathRow = page.getByRole('row', { name: /^Path/ });
  const typeRow = page.getByRole('row', { name: /^Type/ });

  expect(column).toBeVisible();
  expect(nameRow).toMatchTextContent(/datatype$/);
  expect(pathRow).toMatchTextContent(/\/entities\/datatype$/);
  expect(typeRow).toMatchTextContent(/Compound$/);
});

test('inspect unresolved soft link', async () => {
  await renderApp('/entities/unresolved_soft_link');
  await page.getByRole('tab', { name: 'Inspect' }).click();

  const column = page.getByRole('columnheader', { name: 'Entity' });
  const nameRow = page.getByRole('row', { name: /^Name/ });
  const pathRow = page.getByRole('row', { name: /^Path/ });
  const linkRow = page.getByRole('row', { name: /^Soft link/ });

  expect(column).toBeVisible();
  expect(nameRow).toMatchTextContent(/unresolved_soft_link$/);
  expect(pathRow).toMatchTextContent(/\/entities\/unresolved_soft_link$/);
  expect(linkRow).toMatchTextContent(/\/foo$/);
});

test('inspect unresolved external link', async () => {
  await renderApp('/entities/unresolved_external_link');
  await page.getByRole('tab', { name: 'Inspect' }).click();

  const column = page.getByRole('columnheader', { name: 'Entity' });
  const linkRow = page.getByRole('row', { name: /^External link/ });
  expect(column).toBeVisible();
  expect(linkRow).toMatchTextContent(/my_file.h5:entry_000\/dataset$/);
});

test('follow path attributes', async () => {
  const { selectNexusExplorerNode } = await renderApp();
  await page.getByRole('tab', { name: 'Inspect' }).click();

  // Follow relative `default` attribute
  await page.getByRole('button', { name: 'Inspect nexus' }).click();

  const nxEntry = page.getByRole('treeitem', { name: /^nexus / });
  expect(nxEntry).toHaveAttribute('aria-selected', 'true');
  expect(nxEntry).toHaveAttribute('aria-expanded', 'true');

  await selectNexusExplorerNode('default_absolute');

  // Follow absolute `default` attribute
  await page.getByRole('button', { name: 'Inspect /nexus/NXdata' }).click();

  const nxData = page.getByRole('treeitem', { name: /NXdata/ });
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
  await expect.element(page.getByText('some error')).toBeVisible();
  errorSpy.mockRestore();
});
