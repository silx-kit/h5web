import { App } from '@h5web/app';
import { expect, test } from 'vitest';
import { page, server, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import H5WasmBufferProvider from '../H5WasmBufferProvider';

const { readFile } = server.commands;
const SKIP = import.meta.env.VITE_H5WASM_SKIP === 'true';
const FILE_PATH = '../../support/files/dist/sample.h5'; // relative to `@h5web/h5wasm` project root

test.skipIf(SKIP)('render viewer', async () => {
  const { buffer } = Uint8Array.fromBase64(await readFile(FILE_PATH, 'base64'));

  const user = userEvent.setup();

  await render(
    <div style={{ height: '100vh' }}>
      <H5WasmBufferProvider filename="sample.h5" buffer={buffer}>
        <App />
      </H5WasmBufferProvider>
    </div>,
  );

  await user.click(
    page.getByRole('treeitem', { name: 'int8_scalar', exact: true }),
  );
  await expect.element(page.getByText('-128')).toBeVisible();
});
