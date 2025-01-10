import type { Remote } from 'comlink';
import { wrap } from 'comlink';

import type { H5WasmWorkerAPI } from './worker';
import LocalWorker from './worker?worker&inline';

let remote: Remote<H5WasmWorkerAPI>;

export function getH5WasmRemote(): Remote<H5WasmWorkerAPI> {
  if (!remote) {
    remote = wrap<H5WasmWorkerAPI>(new LocalWorker());
  }

  return remote;
}
