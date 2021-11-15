import type { Entity } from '@h5web/shared';

import { getSupportedCoreVis } from './core/pack-utils';
import type { VisDef } from './models';
import { getNxDefaultPath, getSupportedNxVis } from './nexus/pack-utils';

function findSupportedVis(entity: Entity): VisDef[] {
  const nxVis = getSupportedNxVis(entity);
  if (nxVis) {
    return [nxVis];
  }

  return getSupportedCoreVis(entity);
}

export function resolvePath(
  path: string,
  getEntity: (path: string) => Entity
): { entity: Entity; supportedVis: VisDef[] } | undefined {
  const entity = getEntity(path);

  const supportedVis = findSupportedVis(entity);
  if (supportedVis.length > 0) {
    return { entity, supportedVis };
  }

  const nxDefaultPath = getNxDefaultPath(entity);
  if (nxDefaultPath) {
    return resolvePath(nxDefaultPath, getEntity);
  }

  return undefined;
}
