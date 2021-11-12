import type { Entity } from '@h5web/shared';

import { getSupportedVis as getSupportedCoreVis } from './core/pack-utils';
import type { VisDef } from './models';
import { getSupportedVis as getSupportedNxVis } from './nexus/pack-utils';

export function findSupportedVis(entity: Entity): VisDef[] {
  const nxVis = getSupportedNxVis(entity);
  if (nxVis) {
    return [nxVis];
  }

  return getSupportedCoreVis(entity);
}
