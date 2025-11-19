import { assertStr, isDataset, isDefined, isGroup } from '@h5web/shared/guards';
import {
  type ChildEntity,
  type Dataset,
  type GroupWithChildren,
  type ProvidedEntity,
} from '@h5web/shared/hdf5-models';
import { buildEntityPath } from '@h5web/shared/hdf5-utils';

import { type AttrValuesStore, type EntitiesStore } from '../providers/models';
import { hasAttribute } from '../utils';
import {
  CORE_VIS,
  type CoreVisDef,
  Vis,
} from '../vis-packs/core/visualizations';
import { type VisDef } from '../vis-packs/models';
import {
  findSignalDataset,
  isNxDataGroup,
  isNxNoteGroup,
} from '../vis-packs/nexus/utils';
import { NX_DATA_VIS, NX_NOTE_VIS } from '../vis-packs/nexus/visualizations';

export async function getResolvePath(
  path: string,
  entitiesStore: EntitiesStore,
  attrValuesStore: AttrValuesStore,
): Promise<
  | { entity: ProvidedEntity; supportedVis: VisDef[]; primaryVis?: VisDef }
  | undefined
> {
  const entity = await entitiesStore.get(path);

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

    const results = await Promise.all(
      Object.values(NX_DATA_VIS).map(async (vis) => {
        const supported = await vis.supports(entity, signal, attrValuesStore);
        return supported ? vis : undefined;
      }),
    );

    const supportedVis = results.filter(isDefined);
    if (supportedVis.length > 0) {
      const { interpretation } = await attrValuesStore.get(signal);
      return {
        entity,
        supportedVis,
        primaryVis: supportedVis.find((v) => v.isPrimary(interpretation)),
      };
    }
  }

  const nxDefaultPath = await getNxDefaultPath(entity, attrValuesStore);
  if (nxDefaultPath) {
    return getResolvePath(nxDefaultPath, entitiesStore, attrValuesStore);
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

async function getNxDefaultPath(
  group: GroupWithChildren,
  attrValuesStore: AttrValuesStore,
): Promise<string | undefined> {
  const { default: defaultPath } = await attrValuesStore.get(group);

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
