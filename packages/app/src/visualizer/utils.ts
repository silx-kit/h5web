import type { Entity } from '@h5web/shared';
import {
  assertGroupWithChildren,
  assertStr,
  buildEntityPath,
  hasComplexType,
  hasMinDims,
  hasNumDims,
  isDataset,
  isGroup,
  NxInterpretation,
} from '@h5web/shared';

import type { AttrValuesStore, EntitiesStore } from '../providers/models';
import { hasAttribute } from '../utils';
import type { CoreVisDef } from '../vis-packs/core/visualizations';
import { CORE_VIS, Vis } from '../vis-packs/core/visualizations';
import type { VisDef } from '../vis-packs/models';
import {
  findAxesDatasets,
  findSignalDataset,
  isNxDataGroup,
} from '../vis-packs/nexus/utils';
import { NexusVis, NEXUS_VIS } from '../vis-packs/nexus/visualizations';

export function resolvePath(
  path: string,
  entitiesStore: EntitiesStore,
  attrValueStore: AttrValuesStore
): { entity: Entity; supportedVis: VisDef[] } | undefined {
  const entity = entitiesStore.get(path);

  const supportedVis = findSupportedVis(entity, attrValueStore);
  if (supportedVis.length > 0) {
    return { entity, supportedVis };
  }

  const nxDefaultPath = getNxDefaultPath(entity, attrValueStore);
  if (nxDefaultPath) {
    return resolvePath(nxDefaultPath, entitiesStore, attrValueStore);
  }

  return undefined;
}

function findSupportedVis(
  entity: Entity,
  attrValueStore: AttrValuesStore
): VisDef[] {
  const nxVis = getSupportedNxVis(entity, attrValueStore);
  if (nxVis.length > 0) {
    return nxVis;
  }

  return getSupportedCoreVis(entity, attrValueStore);
}

function getNxDefaultPath(
  entity: Entity,
  attrValueStore: AttrValuesStore
): string | undefined {
  if (!isGroup(entity)) {
    return undefined;
  }

  const { default: defaultPath } = attrValueStore.get(entity);

  if (defaultPath) {
    assertStr(defaultPath, `Expected 'default' attribute to be a string`);

    return defaultPath.startsWith('/')
      ? defaultPath
      : buildEntityPath(entity.path, defaultPath);
  }

  assertGroupWithChildren(entity);
  return getImplicitDefaultChild(entity.children, attrValueStore)?.path;
}

function getSupportedCoreVis(
  entity: Entity,
  attrValueStore: AttrValuesStore
): CoreVisDef[] {
  const supportedVis = Object.values(CORE_VIS).filter(
    (vis) => isDataset(entity) && vis.supportsDataset(entity, attrValueStore)
  );

  return supportedVis.length > 1 && supportedVis[0].name === Vis.Raw
    ? supportedVis.slice(1)
    : supportedVis;
}

function getSupportedNxVis(
  entity: Entity,
  attrValuesStore: AttrValuesStore
): VisDef[] {
  if (!isGroup(entity)) {
    return [];
  }

  assertGroupWithChildren(entity);
  if (!isNxDataGroup(entity, attrValuesStore)) {
    return [];
  }

  const dataset = findSignalDataset(entity, attrValuesStore);
  const isCplx = hasComplexType(dataset);
  const { interpretation } = attrValuesStore.get(dataset);

  if (
    interpretation === NxInterpretation.RGB &&
    hasNumDims(dataset, 3) &&
    !isCplx
  ) {
    return [NEXUS_VIS[NexusVis.NxRGB]];
  }

  const imageVis = isCplx ? NexusVis.NxComplexImage : NexusVis.NxImage;
  const spectrumVis = isCplx ? NexusVis.NxComplexSpectrum : NexusVis.NxSpectrum;

  if (interpretation === NxInterpretation.Image) {
    return [NEXUS_VIS[imageVis]];
  }

  if (interpretation === NxInterpretation.Spectrum) {
    return [NEXUS_VIS[spectrumVis]];
  }

  // Fall back on dimension checks: 2D+ are Spectrum+Image, 1D can be Scatter or Spectrum
  if (hasMinDims(dataset, 2)) {
    return [NEXUS_VIS[spectrumVis], NEXUS_VIS[imageVis]];
  }

  const axisDatasets = findAxesDatasets(entity, dataset, attrValuesStore);

  if (
    axisDatasets.length === 2 &&
    axisDatasets.every((d) => d && hasNumDims(d, 1))
  ) {
    return [NEXUS_VIS[NexusVis.NxScatter]];
  }

  return [NEXUS_VIS[spectrumVis]];
}

function getImplicitDefaultChild(
  children: Entity[],
  attrValueStore: AttrValuesStore
): Entity | undefined {
  const nxGroups = children
    .filter(isGroup)
    .filter((g) => hasAttribute(g, 'NX_class'));

  // Look for an `NXdata` child group first
  const nxDataChild = nxGroups.find(
    (g) => attrValueStore.getSingle(g, 'NX_class') === 'NXdata'
  );

  if (nxDataChild) {
    return nxDataChild;
  }

  // Then for an `NXentry` child group
  const nxEntryChild = nxGroups.find(
    (g) => attrValueStore.getSingle(g, 'NX_class') === 'NXentry'
  );

  if (nxEntryChild) {
    return nxEntryChild;
  }

  // Then for an `NXprocess` child group
  return nxGroups.find(
    (g) => attrValueStore.getSingle(g, 'NX_class') === 'NXprocess'
  );
}
