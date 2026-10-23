import { App } from '@h5web/app';
import { expect, test } from 'vitest';
import { page, server, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import H5WasmLocalFileProvider from '../H5WasmLocalFileProvider';

const { readFile } = server.commands;
const SKIP = import.meta.env.VITE_H5WASM_SKIP === 'true';
const FILE_PATH = '../../support/files/dist/sample.h5'; // relative to `@h5web/h5wasm` project root

test.skipIf(SKIP)('render viewer', async () => {
  const { buffer } = Uint8Array.fromBase64(await readFile(FILE_PATH, 'base64'));
  const file = new File([buffer], 'sample.h5');

  const user = userEvent.setup();

  await render(
    <div style={{ height: '100vh' }}>
      <H5WasmLocalFileProvider file={file}>
        <App />
      </H5WasmLocalFileProvider>
    </div>,
  );

  await user.click(
    page.getByRole('treeitem', { name: 'int8_scalar', exact: true }),
  );
  await expect.element(page.getByText('-128')).toBeVisible();
});
