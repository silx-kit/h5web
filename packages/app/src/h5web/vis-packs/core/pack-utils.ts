import type { Entity } from '@h5web/shared';
import { isDataset } from '@h5web/shared';

import type { CoreVisDef } from './visualizations';
import { CORE_VIS, Vis } from './visualizations';

export function getSupportedVis(entity: Entity): CoreVisDef[] {
  const supportedVis = Object.values(CORE_VIS).filter(
    (vis) => isDataset(entity) && vis.supportsDataset(entity)
  );

  return supportedVis.length > 1 && supportedVis[0].name === Vis.Raw
    ? supportedVis.slice(1)
    : supportedVis;
}
