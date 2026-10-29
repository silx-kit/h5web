import { App, assertEnvVar } from '@h5web/app';
import { beforeAll, expect, test } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import HsdsProvider from '../providers/hsds/HsdsProvider';

const SKIP = import.meta.env.VITE_HSDS_SKIP === 'true';
const HSDS_URL = import.meta.env.VITE_HSDS_URL;
assertEnvVar(HSDS_URL, 'VITE_HSDS_URL');

beforeAll(async () => {
  try {
    await fetch(HSDS_URL);
  } catch (error) {
    throw new Error(`Expected server listening at ${HSDS_URL}`, {
      cause: error,
    });
  }
});

test.skipIf(SKIP)('render viewer', async () => {
  const user = userEvent.setup();

  await render(
    <div style={{ height: '100vh' }}>
      <HsdsProvider url={HSDS_URL} domain="/sample-hsds.h5">
        <App />
      </HsdsProvider>
    </div>,
  );

  await user.click(page.getByRole('treeitem', { name: 'int8_scalar' }));
  await expect.element(page.getByText('-128')).toBeVisible();
});
