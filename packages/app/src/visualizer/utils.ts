import {
  assertStr,
  hasComplexType,
  hasMinDims,
  hasNumDims,
  isDataset,
  isGroup,
} from '@h5web/shared/guards';
import {
  type ChildEntity,
  type ProvidedEntity,
} from '@h5web/shared/hdf5-models';
import { buildEntityPath } from '@h5web/shared/hdf5-utils';
import { NxInterpretation } from '@h5web/shared/nexus-models';

import { type AttrValuesStore, type EntitiesStore } from '../providers/models';
import { hasAttribute } from '../utils';
import {
  CORE_VIS,
  type CoreVisDef,
  Vis,
} from '../vis-packs/core/visualizations';
import { type VisDef } from '../vis-packs/models';
import {
  findAxesDatasets,
  findSignalDataset,
  isNxDataGroup,
  isNxNoteGroup,
} from '../vis-packs/nexus/utils';
import { NEXUS_VIS, NexusVis } from '../vis-packs/nexus/visualizations';

export function resolvePath(
  path: string,
  entitiesStore: EntitiesStore,
  attrValuesStore: AttrValuesStore,
): { entity: ProvidedEntity; supportedVis: VisDef[] } | undefined {
  const entity = entitiesStore.get(path);

  const supportedVis = findSupportedVis(entity, attrValuesStore);
  if (supportedVis.length > 0) {
    return { entity, supportedVis };
  }

  const nxDefaultPath = getNxDefaultPath(entity, attrValuesStore);
  if (nxDefaultPath) {
    return resolvePath(nxDefaultPath, entitiesStore, attrValuesStore);
  }

  return undefined;
}

function findSupportedVis(
  entity: ProvidedEntity,
  attrValuesStore: AttrValuesStore,
): VisDef[] {
  const nxVis = getSupportedNxVis(entity, attrValuesStore);
  if (nxVis.length > 0) {
    return nxVis;
  }

  return getSupportedCoreVis(entity, attrValuesStore);
}

function getSupportedCoreVis(
  entity: ProvidedEntity,
  attrValuesStore: AttrValuesStore,
): CoreVisDef[] {
  const supportedVis = Object.values(CORE_VIS).filter(
    (vis) => isDataset(entity) && vis.supportsDataset(entity, attrValuesStore),
  );

  return supportedVis.length > 1
    ? supportedVis.filter((vis) => vis.name !== Vis.Raw)
    : supportedVis;
}

function getSupportedNxVis(
  entity: ProvidedEntity,
  attrValuesStore: AttrValuesStore,
): VisDef[] {
  if (!isGroup(entity)) {
    return [];
  }

  if (isNxNoteGroup(entity, attrValuesStore)) {
    return [NEXUS_VIS[NexusVis.NxNote]];
  }

  if (!isNxDataGroup(entity, attrValuesStore)) {
    return [];
  }

  const dataset = findSignalDataset(entity, attrValuesStore);
  const isCplx = hasComplexType(dataset);
  const { interpretation, CLASS } = attrValuesStore.get(dataset);

  if (
    (interpretation === NxInterpretation.RGB || CLASS === 'IMAGE') &&
    hasMinDims(dataset, 3) && // 2 for axes + 1 for RGB channels
    dataset.shape[dataset.shape.length - 1] === 3 && // 3 channels
    !isCplx
  ) {
    return [NEXUS_VIS[NexusVis.NxRGB]];
  }

  const nxLineVis = isCplx ? NexusVis.NxComplexLine : NexusVis.NxLine;

  if (interpretation === NxInterpretation.Image) {
    return [NEXUS_VIS[NexusVis.NxHeatmap]];
  }

  if (interpretation === NxInterpretation.Spectrum) {
    return [NEXUS_VIS[nxLineVis]];
  }

  // Fall back on dimension checks: 2D+ is Line + Heatmap, 1D can be Scatter or Line
  if (hasMinDims(dataset, 2)) {
    return [NEXUS_VIS[nxLineVis], NEXUS_VIS[NexusVis.NxHeatmap]];
  }

  const axisDatasets = findAxesDatasets(entity, dataset, attrValuesStore);

  if (
    axisDatasets.length === 2 &&
    axisDatasets.every((d) => d && hasNumDims(d, 1))
  ) {
    return [NEXUS_VIS[NexusVis.NxScatter]];
  }

  return [NEXUS_VIS[nxLineVis]];
}

function getNxDefaultPath(
  entity: ProvidedEntity,
  attrValuesStore: AttrValuesStore,
): string | undefined {
  if (!isGroup(entity)) {
    return undefined;
  }

  const { default: defaultPath } = attrValuesStore.get(entity);

  if (defaultPath) {
    assertStr(defaultPath, `Expected 'default' attribute to be a string`);

    return defaultPath.startsWith('/')
      ? defaultPath
      : buildEntityPath(entity.path, defaultPath);
  }

  return getImplicitDefaultChild(entity.children, attrValuesStore)?.path;
}

function getImplicitDefaultChild(
  children: ChildEntity[],
  attrValuesStore: AttrValuesStore,
): ChildEntity | undefined {
  const nxGroups = children
    .filter(isGroup)
    .filter((g) => hasAttribute(g, 'NX_class'));

  // Look for an `NXdata` child group first
  const nxDataChild = nxGroups.find(
    (g) => attrValuesStore.getSingle(g, 'NX_class') === 'NXdata',
  );

  if (nxDataChild) {
    return nxDataChild;
  }

  // Then for an `NXentry` child group
  const nxEntryChild = nxGroups.find(
    (g) => attrValuesStore.getSingle(g, 'NX_class') === 'NXentry',
  );

  if (nxEntryChild) {
    return nxEntryChild;
  }

  // Then for an `NXprocess` child group
  return nxGroups.find(
    (g) => attrValuesStore.getSingle(g, 'NX_class') === 'NXprocess',
  );
}
