import type { Remote } from 'comlink';
import { wrap } from 'comlink';

import type { H5WasmWorkerAPI } from './worker';

let remote: Remote<H5WasmWorkerAPI>;

export function getH5WasmRemote() {
  if (remote) {
    return remote;
  }

  const worker = new Worker(new URL('worker.ts', import.meta.url), {
    type: 'module',
  });

  remote = wrap<H5WasmWorkerAPI>(worker);
  return remote;
}
