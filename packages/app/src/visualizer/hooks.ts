import { useState } from 'react';

import type { VisDef } from '../vis-packs/models';

export function useActiveVis<T extends VisDef>(supportedVis: T[]) {
  const lastVis = supportedVis[supportedVis.length - 1];

  const state = useState<T>(lastVis);
  const [activeVis, setActiveVis] = state;

  if (!supportedVis.includes(activeVis)) {
    setActiveVis(lastVis);
  }

  return state;
}
