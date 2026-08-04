import { beforeEach, vi } from 'vitest';
import failOnConsole from 'vitest-fail-on-console';

import { enableBigIntSerialization } from './utils';

vi.mock(import('./providers/mock/utils'), { spy: true });

enableBigIntSerialization();

failOnConsole({
  silenceMessage: (message) =>
    message.includes(
      'THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.',
    ),
});

beforeEach(() => {
  localStorage.clear();
});
