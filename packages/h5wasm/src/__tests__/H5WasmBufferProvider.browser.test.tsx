import { App } from '@h5web/app';
import { expect, test, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { H5WasmApi } from '../h5wasm-api';
import H5WasmBufferProvider from '../H5WasmBufferProvider';
import { readFileAsBuffer } from '../test-utils';

vi.mock(import('../h5wasm-api'), { spy: true });

const SKIP = import.meta.env.VITE_H5WASM_SKIP === 'true';

test.skipIf(SKIP)('render viewer and change file', async () => {
  const user = userEvent.setup();
  const sampleBuffer = await readFileAsBuffer('sample.h5');

  const { rerender, unmount } = await render(
    <div style={{ height: '100vh' }}>
      <H5WasmBufferProvider filename="sample.h5" buffer={sampleBuffer}>
        <App />
      </H5WasmBufferProvider>
    </div>,
  );

  // One instanciation, zero clean-up
  expect(H5WasmApi).toHaveBeenCalledOnce();
  expect(H5WasmApi.prototype.cleanUp).not.toHaveBeenCalled();

  await user.click(
    page.getByRole('treeitem', { name: 'int8_scalar', exact: true }),
  );
  await expect.element(page.getByText('-128')).toBeVisible();

  // Re-render with another file
  const linksBuffer = await readFileAsBuffer('links.h5');

  await rerender(
    <div style={{ height: '100vh' }}>
      <H5WasmBufferProvider filename="links.h5" buffer={linksBuffer}>
        <App />
      </H5WasmBufferProvider>
    </div>,
  );

  // Two instanciations, one clean-up
  expect(H5WasmApi).toHaveBeenCalledTimes(2);
  expect(H5WasmApi.prototype.cleanUp).toHaveBeenCalledOnce();

  await expect
    .element(page.getByRole('treeitem', { name: 'group', exact: true }))
    .toBeVisible();

  // Two clean-ups
  await unmount();
  expect(H5WasmApi.prototype.cleanUp).toHaveBeenCalledTimes(2);
});
