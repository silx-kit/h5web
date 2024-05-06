import { useState } from 'react';

import type { DimensionMapping } from './models';

export function useDimMappingState(dims: number[], axesCount: number) {
  return useState<DimensionMapping>([
    ...Array.from({ length: dims.length - axesCount }, () => 0),
    ...['y' as const, 'x' as const].slice(-axesCount),
  ]);
}
