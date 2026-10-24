import { createContext, useContext } from 'react';

/* Element containing the active visualization, e.g. for snapshots */
export const VisAreaContext = createContext<HTMLElement | null>(null);

export function useVisArea(): HTMLElement | null {
  return useContext(VisAreaContext);
}
