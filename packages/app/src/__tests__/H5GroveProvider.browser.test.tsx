import { App, assertEnvVar } from '@h5web/app';
import { beforeAll, expect, test } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import H5GroveProvider from '../providers/h5grove/H5GroveProvider';

const SKIP = import.meta.env.VITE_H5GROVE_SKIP === 'true';
const H5GROVE_URL = import.meta.env.VITE_H5GROVE_URL;
assertEnvVar(H5GROVE_URL, 'VITE_H5GROVE_URL');

beforeAll(async () => {
  try {
    await fetch(H5GROVE_URL);
  } catch (error) {
    throw new Error(`Expected server listening at ${H5GROVE_URL}`, {
      cause: error,
    });
  }
});

test.skipIf(SKIP)('render viewer', async () => {
  const user = userEvent.setup();

  await render(
    <div style={{ height: '100vh' }}>
      <H5GroveProvider url={H5GROVE_URL} filepath="sample.h5">
        <App />
      </H5GroveProvider>
    </div>,
  );

  await user.click(
    page.getByRole('treeitem', { name: 'int8_scalar', exact: true }),
  );
  await expect.element(page.getByText('-128')).toBeVisible();
});
