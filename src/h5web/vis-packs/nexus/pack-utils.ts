import type { FetchStore } from 'react-suspense-fetch';
import { assertStr, hasComplexType, hasMinDims, isGroup } from '../../guards';
import { Entity, ProviderError } from '../../providers/models';
import { buildEntityPath, handleError } from '../../utils';
import type { VisDef } from '../models';
import { NxInterpretation } from './models';
import { findSignalDataset, getAttributeValue, isNxDataGroup } from './utils';
import { NexusVis, NEXUS_VIS } from './visualizations';

export function getDefaultEntity(
  entity: Entity,
  entitiesStore: FetchStore<Entity, string>
): Entity {
  const defaultPath = getAttributeValue(entity, 'default');
  if (defaultPath === undefined) {
    return entity;
  }

  assertStr(defaultPath, `Expected 'default' attribute to be a string`);
  const path = defaultPath.startsWith('/')
    ? defaultPath
    : buildEntityPath(entity.path, defaultPath);

  const defaultEntity = handleError(
    () => entitiesStore.get(path),
    ProviderError.NotFound,
    `No entity found at NeXus default path "${path}"`
  );

  return getDefaultEntity(defaultEntity, entitiesStore);
}

export function getSupportedVis(entity: Entity): VisDef | undefined {
  if (!isGroup(entity) || !isNxDataGroup(entity)) {
    return undefined;
  }

  const dataset = findSignalDataset(entity);

  if (hasComplexType(dataset)) {
    // 1D Nexus complex signal is not supported
    return hasMinDims(dataset, 2) ? NEXUS_VIS[NexusVis.NxComplex] : undefined;
  }

  const interpretation = getAttributeValue(dataset, 'interpretation');
  if (interpretation === NxInterpretation.Image) {
    return NEXUS_VIS[NexusVis.NxImage];
  }

  if (interpretation === NxInterpretation.Spectrum) {
    return NEXUS_VIS[NexusVis.NxSpectrum];
  }

  return hasMinDims(dataset, 2)
    ? NEXUS_VIS[NexusVis.NxImage]
    : NEXUS_VIS[NexusVis.NxSpectrum];
}
