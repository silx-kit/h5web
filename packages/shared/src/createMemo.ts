/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from 'react';

export function createMemo<T extends (...args: any[]) => any>(fn: T): T;

export function createMemo<T extends (...args: any[]) => any>(fn: T) {
  return (...args: unknown[]): unknown => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useMemo<unknown>(() => fn(...args), args);
  };
}
