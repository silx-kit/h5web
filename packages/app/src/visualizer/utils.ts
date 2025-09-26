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
  type Dataset,
  type GroupWithChildren,
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
import {
  NX_DATA_VIS,
  NX_NOTE_VIS,
  NxDataVis,
} from '../vis-packs/nexus/visualizations';

export function resolvePath(
  path: string,
  entitiesStore: EntitiesStore,
  attrValuesStore: AttrValuesStore,
): { entity: ProvidedEntity; supportedVis: VisDef[] } | undefined {
  const entity = entitiesStore.get(path);

  if (isDataset(entity)) {
    const supportedVis = getSupportedCoreVis(entity, attrValuesStore);
    return supportedVis.length > 0 ? { entity, supportedVis } : undefined;
  }

  if (!isGroup(entity)) {
    return undefined;
  }

  if (isNxNoteGroup(entity, attrValuesStore)) {
    return { entity, supportedVis: [NX_NOTE_VIS] };
  }

  if (isNxDataGroup(entity, attrValuesStore)) {
    const supportedVis = getSupportedNxDataVis(entity, attrValuesStore);
    if (supportedVis.length > 0) {
      return { entity, supportedVis };
    }
  }

  const nxDefaultPath = getNxDefaultPath(entity, attrValuesStore);
  if (nxDefaultPath) {
    return resolvePath(nxDefaultPath, entitiesStore, attrValuesStore);
  }

  return undefined;
}

function getSupportedCoreVis(
  dataset: Dataset,
  attrValuesStore: AttrValuesStore,
): CoreVisDef[] {
  const supportedVis = Object.values(CORE_VIS).filter((vis) =>
    vis.supportsDataset(dataset, attrValuesStore),
  );

  // Remove `Raw` vis unless it's the only supported vis
  return supportedVis.length > 1
    ? supportedVis.filter((vis) => vis.name !== Vis.Raw)
    : supportedVis;
}

function getSupportedNxDataVis(
  group: GroupWithChildren,
  attrValuesStore: AttrValuesStore,
): VisDef[] {
  const dataset = findSignalDataset(group, attrValuesStore);
  const isCplx = hasComplexType(dataset);
  const { interpretation, CLASS } = attrValuesStore.get(dataset);

  if (
    (interpretation === NxInterpretation.RGB || CLASS === 'IMAGE') &&
    hasMinDims(dataset, 3) && // 2 for axes + 1 for RGB channels
    dataset.shape[dataset.shape.length - 1] === 3 && // 3 channels
    !isCplx
  ) {
    return [NX_DATA_VIS[NxDataVis.NxRGB]];
  }

  const nxLineVis = isCplx ? NxDataVis.NxComplexLine : NxDataVis.NxLine;

  if (interpretation === NxInterpretation.Image) {
    return [NX_DATA_VIS[NxDataVis.NxHeatmap]];
  }

  if (interpretation === NxInterpretation.Spectrum) {
    return [NX_DATA_VIS[nxLineVis]];
  }

  // Fall back on dimension checks: 2D+ is Line + Heatmap, 1D can be Scatter or Line
  if (hasMinDims(dataset, 2)) {
    return [NX_DATA_VIS[nxLineVis], NX_DATA_VIS[NxDataVis.NxHeatmap]];
  }

  const axisDatasets = findAxesDatasets(group, dataset, attrValuesStore);

  if (
    axisDatasets.length === 2 &&
    axisDatasets.every((d) => d && hasNumDims(d, 1))
  ) {
    return [NX_DATA_VIS[NxDataVis.NxScatter]];
  }

  return [NX_DATA_VIS[nxLineVis]];
}

function getNxDefaultPath(
  group: GroupWithChildren,
  attrValuesStore: AttrValuesStore,
): string | undefined {
  const { default: defaultPath } = attrValuesStore.get(group);

  if (defaultPath) {
    assertStr(defaultPath, `Expected 'default' attribute to be a string`);

    return defaultPath.startsWith('/')
      ? defaultPath
      : buildEntityPath(group.path, defaultPath);
  }

  return getImplicitDefaultChild(group.children, attrValuesStore)?.path;
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
