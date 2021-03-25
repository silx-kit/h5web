import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  findVisSelector,
  queryVisSelector,
  renderApp,
  selectExplorerNode,
} from '../test-utils';

test('switch between "display" and "inspect" modes', async () => {
  renderApp();

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
  renderApp();
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
  renderApp();
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
  expect(shapeRow).toHaveTextContent(/H5S_SCALAR/);
  expect(typeRow).toHaveTextContent(/integer/);
});

test('inspect simple dataset', async () => {
  renderApp();
  userEvent.click(await screen.findByRole('tab', { name: 'Inspect' }));
  await selectExplorerNode('nD_datasets/threeD');

  const shapeRow = await screen.findByRole('row', { name: /^Shape/ });
  expect(shapeRow).toHaveTextContent(/9 x 20 x 41 = 7380/);
});

test('inspect datatype', async () => {
  renderApp();
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
  expect(typeRow).toHaveTextContent(/compound/);
});

test('inspect external link', async () => {
  renderApp();
  userEvent.click(await screen.findByRole('tab', { name: 'Inspect' }));
  await selectExplorerNode('entities/external_link');

  const column = await screen.findByRole('columnheader', { name: /Link/ });
  const nameRow = screen.getByRole('row', { name: /^Name/ });
  const pathRow = screen.getByRole('row', { name: /^Path/ });
  const fileRow = screen.getByRole('row', { name: /^File/ });
  const h5pathRow = screen.getByRole('row', { name: /^H5Path/ });

  expect(column).toBeVisible();
  expect(nameRow).toHaveTextContent(/external_link/);
  expect(pathRow).toHaveTextContent(/\/entities\/external_link/);
  expect(fileRow).toHaveTextContent(/my_file/);
  expect(h5pathRow).toHaveTextContent(/entry_000\/dataset/);
});
