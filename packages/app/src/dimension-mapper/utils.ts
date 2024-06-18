import type { Axis } from '@h5web/shared/vis-models';
import { useSyncedRef, useUnmountEffect } from '@react-hookz/web';
import type { DependencyList } from 'react';
import { useEffect, useMemo, useRef } from 'react';

export function isAxis(elem: number | Axis): elem is Axis {
  return typeof elem !== 'number';
}

// Debounced callback with a delay that can be adjusted on every invocation
export function useDynamicDebouncedCallback<
  Fn extends (...args: any[]) => void, // eslint-disable-line @typescript-eslint/no-explicit-any
>(
  callback: Fn,
  deps: DependencyList,
  getDelay: (...args: Parameters<Fn>) => number,
): (...args: Parameters<Fn>) => void {
  const timeout = useRef<ReturnType<typeof setTimeout>>();
  const cb = useRef(callback);
  const getDelayRef = useSyncedRef(getDelay);
  const lastCallArgs = useRef<Parameters<Fn>>();

  function clear() {
    if (timeout.current) {
      clearTimeout(timeout.current);
      timeout.current = undefined;
    }
  }

  // Cancel scheduled execution on unmount
  useUnmountEffect(clear);

  useEffect(() => {
    cb.current = callback;
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  return useMemo(() => {
    function execute() {
      clear();

      if (!lastCallArgs.current) {
        return;
      }

      const context = lastCallArgs.current;
      lastCallArgs.current = undefined;

      cb.current(...context);
    }

    return (...args) => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }

      lastCallArgs.current = args;

      // Plan regular execution
      timeout.current = setTimeout(execute, getDelayRef.current(...args));
    };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}
