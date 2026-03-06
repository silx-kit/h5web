import { beforeEach } from 'vitest';
import failOnConsole from 'vitest-fail-on-console';

import { enableBigIntSerialization } from './utils';

enableBigIntSerialization();

failOnConsole();

beforeEach(() => {
  localStorage.clear();
});
