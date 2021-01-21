import { isDataset } from '../../guards';
import type { Entity } from '../../providers/models';
import { CoreVisDef, CORE_VIS, Vis } from './visualizations';

export function getSupportedVis(entity: Entity): CoreVisDef[] {
  const supportedVis = Object.values(CORE_VIS).filter(
    (vis) => isDataset(entity) && vis.supportsDataset(entity)
  );

  return supportedVis.length > 1 && supportedVis[0].name === Vis.Raw
    ? supportedVis.slice(1)
    : supportedVis;
}
