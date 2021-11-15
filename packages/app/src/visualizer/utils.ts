import type { Entity } from '@h5web/shared';
import {
  assertGroupWithChildren,
  hasComplexType,
  hasMinDims,
  hasNumDims,
  isGroup,
  isDataset,
  assertStr,
  buildEntityPath,
} from '@h5web/shared';
import { NxInterpretation } from '@h5web/shared/src/models-nexus';

import { getAttributeValue } from '../utils';
import type { CoreVisDef } from '../vis-packs/core/visualizations';
import { Vis, CORE_VIS } from '../vis-packs/core/visualizations';
import type { VisDef } from '../vis-packs/models';
import {
  findSignalDataset,
  hasNxClass,
  isNxDataGroup,
} from '../vis-packs/nexus/utils';
import { NexusVis, NEXUS_VIS } from '../vis-packs/nexus/visualizations';

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

function findSupportedVis(entity: Entity): VisDef[] {
  const nxVis = getSupportedNxVis(entity);
  if (nxVis) {
    return [nxVis];
  }

  return getSupportedCoreVis(entity);
}

function getNxDefaultPath(entity: Entity): string | undefined {
  if (!isGroup(entity)) {
    return undefined;
  }

  const defaultPath = getAttributeValue(entity, 'default');

  if (defaultPath) {
    assertStr(defaultPath, `Expected 'default' attribute to be a string`);

    return defaultPath.startsWith('/')
      ? defaultPath
      : buildEntityPath(entity.path, defaultPath);
  }

  assertGroupWithChildren(entity);
  return getImplicitDefaultChild(entity.children)?.path;
}

export function getSupportedCoreVis(entity: Entity): CoreVisDef[] {
  const supportedVis = Object.values(CORE_VIS).filter(
    (vis) => isDataset(entity) && vis.supportsDataset(entity)
  );

  return supportedVis.length > 1 && supportedVis[0].name === Vis.Raw
    ? supportedVis.slice(1)
    : supportedVis;
}

export function getSupportedNxVis(entity: Entity): VisDef | undefined {
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

function getImplicitDefaultChild(children: Entity[]): Entity | undefined {
  const groups = children.filter(isGroup);

  // Look for an `NXdata` child group first
  const nxDataChild = groups.find((g) => hasNxClass(g, 'NXdata'));
  if (nxDataChild) {
    return nxDataChild;
  }

  // Then for an `NXentry` child group
  const nxEntryChild = groups.find((g) => hasNxClass(g, 'NXentry'));
  if (nxEntryChild) {
    return nxEntryChild;
  }

  // Then for an `NXprocess` child group
  return groups.find((g) => hasNxClass(g, 'NXprocess'));
}
