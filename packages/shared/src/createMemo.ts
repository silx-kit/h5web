/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from 'react';

export function createMemo<T extends (...args: any[]) => any>(fn: T): T;

export function createMemo<T extends (...args: any[]) => any>(fn: T) {
  return (...args: any[]) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,react-hooks/exhaustive-deps
    return useMemo<any>(() => fn(...args), args);
  };
}
