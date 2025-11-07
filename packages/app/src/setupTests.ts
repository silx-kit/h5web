/* eslint-disable @typescript-eslint/no-empty-function */
import '@testing-library/jest-dom/vitest';

import { type Measures } from '@react-hookz/web';
import { cleanup as rtlCleanup } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, vi } from 'vitest';
import failOnConsole from 'vitest-fail-on-console';

globalThis.ResizeObserver = class ResizeObserver {
  public observe() {}
  public unobserve() {}
  public disconnect() {}
};

globalThis.matchMedia = (query: string) => ({
  matches: false,
  media: query,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  onchange: vi.fn(),
  addListener: vi.fn(),
  removeListener: vi.fn(),
  dispatchEvent: vi.fn(),
});

// Fake properties to avoid Re-flex warnings
// https://github.com/leefsmp/Re-Flex/issues/27
// https://github.com/jsdom/jsdom/issues/135
['offsetWidth', 'offsetHeight'].forEach((prop) => {
  Object.defineProperty(globalThis.HTMLElement.prototype, prop, {
    configurable: true,
    value: 500,
  });
});

// Fail tests that log to the console
failOnConsole();

afterEach(() => {
  rtlCleanup(); // https://vitest.dev/guide/migration.html#globals-as-a-default
  localStorage.clear();

  if (vi.isFakeTimers()) {
    vi.runAllTimers();
    vi.useRealTimers();

    // @ts-expect-error - Remove workaround for RTL when fake timers are enabled
    // (cf. `renderApp()` in test-utils.tsx)
    delete globalThis.jest;
  }
});

// Mock the size of elements measured with `useMeasure`
// Use attribute `data-test-size="<width>,<height>"` to specify the element's size
vi.mock('@react-hookz/web', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const mod = await importOriginal<typeof import('@react-hookz/web')>();

  return {
    ...mod,
    useMeasure: () => {
      const [size, setSize] = useState<Measures>();
      const ref = vi.fn((elem: HTMLElement | null) => {
        if (!size && elem?.dataset.testSize) {
          const [width, height] = elem.dataset.testSize.split(',');
          setSize({
            width: Number.parseInt(width),
            height: Number.parseInt(height),
          });
        }
      });
      return [size, ref];
    },
  };
});
