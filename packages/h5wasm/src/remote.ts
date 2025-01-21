import { type Remote, wrap } from 'comlink';

import { type H5WasmWorkerAPI } from './worker';
import LocalWorker from './worker?worker&inline';

let remote: Remote<H5WasmWorkerAPI> | undefined;

export function getH5WasmRemote(): Remote<H5WasmWorkerAPI> {
  if (!remote) {
    remote = wrap<H5WasmWorkerAPI>(new LocalWorker());
  }

  return remote;
}
