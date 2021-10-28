import {
  assertGroupWithChildren,
  assertStr,
  buildEntityPath,
  handleError,
  hasChildren,
  hasComplexType,
  hasMinDims,
  hasNumDims,
  isGroup,
} from '@h5web/shared';
import type { Entity } from '@h5web/shared';
import type { FetchStore } from 'react-suspense-fetch';

import { ProviderError } from '../../providers/models';
import { getAttributeValue } from '../../utils';
import type { VisDef } from '../models';
import { NxInterpretation } from './models';
import { findSignalDataset, isNxDataGroup, isNxGroup } from './utils';
import { NexusVis, NEXUS_VIS } from './visualizations';

function getDefaultEntityPath(entity: Entity): string | undefined {
  const defaultPath = getAttributeValue(entity, 'default');
  if (defaultPath) {
    assertStr(defaultPath, `Expected 'default' attribute to be a string`);
    return defaultPath;
  }

  if (!isGroup(entity) || !hasChildren(entity)) {
    return undefined;
  }

  const nxChild = entity.children.find((c) => isNxGroup(c));
  return nxChild?.path;
}

export function getDefaultEntity(
  entity: Entity,
  entitiesStore: FetchStore<Entity, string>
): Entity {
  const defaultPath = getDefaultEntityPath(entity);
  if (defaultPath === undefined) {
    return entity;
  }
  const path = defaultPath.startsWith('/')
    ? defaultPath
    : buildEntityPath(entity.path, defaultPath);

  const defaultEntity = handleError(
    () => entitiesStore.get(path),
    ProviderError.EntityNotFound,
    `No entity found at NeXus default path "${path}"`
  );

  return getDefaultEntity(defaultEntity, entitiesStore);
}

export function getSupportedVis(entity: Entity): VisDef | undefined {
  if (!isGroup(entity) || !isNxDataGroup(entity)) {
    return undefined;
  }

  assertGroupWithChildren(entity);
  const dataset = findSignalDataset(entity);
  const isCplx = hasComplexType(dataset);
  const interpretation = getAttributeValue(dataset, 'interpretation');

  if (
    interpretation === NxInterpretation.RGB &&
    hasNumDims(dataset, 3) &&
    !isCplx
  ) {
    return NEXUS_VIS[NexusVis.NxRGB];
  }

  const imageVis = isCplx ? NexusVis.NxComplexImage : NexusVis.NxImage;
  const spectrumVis = isCplx ? NexusVis.NxComplexSpectrum : NexusVis.NxSpectrum;

  if (interpretation === NxInterpretation.Image) {
    return NEXUS_VIS[imageVis];
  }

  if (interpretation === NxInterpretation.Spectrum) {
    return NEXUS_VIS[spectrumVis];
  }

  return NEXUS_VIS[hasMinDims(dataset, 2) ? imageVis : spectrumVis];
}
