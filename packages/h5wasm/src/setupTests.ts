import { beforeEach } from 'vitest';
import failOnConsole from 'vitest-fail-on-console';

failOnConsole({
  silenceMessage: (message) =>
    message.includes(
      'THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.',
    ),
});

beforeEach(() => {
  localStorage.clear();
});
