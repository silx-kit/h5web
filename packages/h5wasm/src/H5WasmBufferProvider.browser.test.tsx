import { App } from '@h5web/app';
import { File as H5WasmFile, ready as h5wasmReady } from 'h5wasm';
import { StrictMode } from 'react';
import { expect, test, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { H5WasmApi } from './h5wasm-api';
import H5WasmBufferProvider from './H5WasmBufferProvider';

async function createFileBuffer(datasetName: string): Promise<ArrayBuffer> {
  const { FS } = await h5wasmReady;

  const file = new H5WasmFile('tmp.h5', 'w');
  file.create_dataset({ name: datasetName, data: [1, 2, 3] });
  file.close();

  const { buffer } = FS.readFile('tmp.h5');
  FS.unlink('tmp.h5');
  return buffer as ArrayBuffer;
}

function renderInStrictMode(filename: string, buffer: ArrayBuffer) {
  return (
    <StrictMode>
      <div style={{ height: '100vh' }}>
        <H5WasmBufferProvider filename={filename} buffer={buffer}>
          <App />
        </H5WasmBufferProvider>
      </div>
    </StrictMode>
  );
}

test('open and close files in strict mode', async () => {
  const cleanUpSpy = vi.spyOn(H5WasmApi.prototype, 'cleanUp');

  const { rerender, unmount } = await render(
    renderInStrictMode('foo.h5', await createFileBuffer('foo')),
  );

  // File in use must not get closed when React re-runs effects
  await expect
    .element(page.getByRole('treeitem', { name: 'foo', exact: true }))
    .toBeVisible();
  expect(cleanUpSpy).not.toHaveBeenCalled();

  // Previous file gets closed when opening another one
  await rerender(renderInStrictMode('bar.h5', await createFileBuffer('bar')));
  await expect
    .element(page.getByRole('treeitem', { name: 'bar', exact: true }))
    .toBeVisible();
  await vi.waitFor(() => expect(cleanUpSpy).toHaveBeenCalledOnce());

  // Current file gets closed on unmount
  await unmount();
  await vi.waitFor(() => expect(cleanUpSpy).toHaveBeenCalledTimes(2));
});
