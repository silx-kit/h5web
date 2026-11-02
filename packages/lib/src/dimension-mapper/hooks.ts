import { createMemo } from '@h5web/shared/createMemo';
import { useSyncedRef, useUnmountEffect } from '@react-hookz/web';
import { type DependencyList, useEffect, useMemo, useRef } from 'react';

import { getSlicedDimsAndMapping } from './utils';

export const useSlicedDimsAndMapping = createMemo(getSlicedDimsAndMapping);

// Debounced callback with a delay that can be adjusted on every invocation
export function useDynamicDebouncedCallback<
  Fn extends (...args: any[]) => void, // eslint-disable-line @typescript-eslint/no-explicit-any
>(
  callback: Fn,
  deps: DependencyList,
  getDelay: (...args: Parameters<Fn>) => number,
): (...args: Parameters<Fn>) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const cbRef = useRef(callback);
  const getDelayRef = useSyncedRef(getDelay);
  const lastCallArgsRef = useRef<Parameters<Fn>>(undefined);

  function clear() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }

  // Cancel scheduled execution on unmount
  useUnmountEffect(clear);

  useEffect(() => {
    cbRef.current = callback;
  }, deps); // eslint-disable-line @eslint-react/exhaustive-deps

  return useMemo(() => {
    function execute() {
      clear();

      if (!lastCallArgsRef.current) {
        return;
      }

      const context = lastCallArgsRef.current;
      lastCallArgsRef.current = undefined;

      cbRef.current(...context);
    }

    return (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      lastCallArgsRef.current = args;

      // Plan regular execution
      timeoutRef.current = setTimeout(execute, getDelayRef.current(...args));
    };
  }, deps); // eslint-disable-line @eslint-react/exhaustive-deps
}
