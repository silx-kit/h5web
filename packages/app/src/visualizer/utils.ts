import { isDataset, isGroup } from '@h5web/shared/guards';
import {
  type ChildEntity,
  type Dataset,
  type GroupWithChildren,
  type ProvidedEntity,
} from '@h5web/shared/hdf5-models';
import { buildEntityPath } from '@h5web/shared/hdf5-utils';

import { type AttrValuesStore, type EntitiesStore } from '../providers/models';
import { findScalarStrAttr, getAttributeValue } from '../utils';
import {
  CORE_VIS,
  type CoreVisDef,
  Vis,
} from '../vis-packs/core/visualizations';
import { type VisDef } from '../vis-packs/models';
import {
  findSignalDataset,
  getNxClass,
  isNxDataGroup,
  isNxNoteGroup,
} from '../vis-packs/nexus/utils';
import { NX_DATA_VIS, NX_NOTE_VIS } from '../vis-packs/nexus/visualizations';

export function resolvePath(
  path: string,
  entitiesStore: EntitiesStore,
  attrValuesStore: AttrValuesStore,
):
  | { entity: ProvidedEntity; supportedVis: VisDef[]; primaryVis?: VisDef }
  | undefined {
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
    const signal = findSignalDataset(entity, attrValuesStore);

    const interpretationAttr = findScalarStrAttr(signal, 'interpretation');
    const interpretation = getAttributeValue(
      signal,
      interpretationAttr,
      attrValuesStore,
    );

    const supportedVis = Object.values(NX_DATA_VIS).filter((vis) =>
      vis.supports(entity, signal, interpretation, attrValuesStore),
    );

    if (supportedVis.length > 0) {
      return {
        entity,
        supportedVis,
        primaryVis: supportedVis.find((v) => v.isPrimary(interpretation)),
      };
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

function getNxDefaultPath(
  group: GroupWithChildren,
  attrValuesStore: AttrValuesStore,
): string | undefined {
  const defaultAttr = findScalarStrAttr(group, 'default');
  if (!defaultAttr) {
    return getImplicitDefaultChild(group.children, attrValuesStore)?.path;
  }

  const defaultPath = getAttributeValue(group, defaultAttr, attrValuesStore);
  return defaultPath.startsWith('/')
    ? defaultPath
    : buildEntityPath(group.path, defaultPath);
}

function getImplicitDefaultChild(
  children: ChildEntity[],
  attrValuesStore: AttrValuesStore,
): ChildEntity | undefined {
  let firstNxEntry: ChildEntity | undefined;
  let firstNxProcess: ChildEntity | undefined;

  for (const child of children) {
    if (!isGroup(child)) {
      continue;
    }

    // Use first `NXdata` child group
    const nxClass = getNxClass(child, attrValuesStore);
    if (nxClass === 'NXdata') {
      return child;
    }

    if (nxClass === 'NXentry' && !firstNxEntry) {
      firstNxEntry = child;
    }

    if (nxClass === 'NXprocess' && !firstNxProcess) {
      firstNxProcess = child;
    }
  }

  // No `NXdata`; use first `NXentry` or `NXprocess` if any
  return firstNxEntry || firstNxProcess;
}
