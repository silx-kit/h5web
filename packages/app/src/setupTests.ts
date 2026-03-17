import { beforeEach, vi } from 'vitest';
import failOnConsole from 'vitest-fail-on-console';

import { enableBigIntSerialization } from './utils';

vi.mock(import('./providers/mock/utils'), { spy: true });

enableBigIntSerialization();

failOnConsole();

beforeEach(() => {
  localStorage.clear();
});
