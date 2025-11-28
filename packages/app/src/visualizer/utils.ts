import { assertStr, isDataset, isDefined, isGroup } from '@h5web/shared/guards';
import {
  type ChildEntity,
  type Dataset,
  type GroupWithChildren,
  type ProvidedEntity,
} from '@h5web/shared/hdf5-models';
import { buildEntityPath } from '@h5web/shared/hdf5-utils';
import memoizee from 'memoizee';

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

export const resolvePath = memoizee(_resolvePath, { promise: true });

async function _resolvePath(
  path: string,
  entitiesStore: EntitiesStore,
  attrValuesStore: AttrValuesStore,
): Promise<
  | { entity: ProvidedEntity; supportedVis: VisDef[]; primaryVis?: VisDef }
  | undefined
> {
  const entity = await entitiesStore.get(path);

  if (isDataset(entity)) {
    const supportedVis = await findSupportedCoreVis(entity, attrValuesStore);
    return supportedVis.length > 0 ? { entity, supportedVis } : undefined;
  }

  if (!isGroup(entity)) {
    return undefined;
  }

  if (await isNxNoteGroup(entity, attrValuesStore)) {
    return { entity, supportedVis: [NX_NOTE_VIS] };
  }

  if (await isNxDataGroup(entity, attrValuesStore)) {
    const signal = await findSignalDataset(entity, attrValuesStore);

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

  const nxDefaultPath = await findNxDefaultPath(entity, attrValuesStore);
  if (nxDefaultPath) {
    return resolvePath(nxDefaultPath, entitiesStore, attrValuesStore);
  }

  return undefined;
}

async function findSupportedCoreVis(
  dataset: Dataset,
  attrValuesStore: AttrValuesStore,
): Promise<CoreVisDef[]> {
  const results = await Promise.all(
    Object.values(CORE_VIS).map(async (vis) => {
      const supported = await vis.supportsDataset(dataset, attrValuesStore);
      return supported ? vis : undefined;
    }),
  );

  const supportedVis = results.filter(isDefined);
  // Remove `Raw` vis unless it's the only supported vis
  return supportedVis.length > 1
    ? supportedVis.filter((vis) => vis.name !== Vis.Raw)
    : supportedVis;
}

async function findNxDefaultPath(
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

  const child = await findImplicitDefaultChild(group.children, attrValuesStore);
  return child?.path;
}

async function findImplicitDefaultChild(
  children: ChildEntity[],
  attrValuesStore: AttrValuesStore,
): Promise<ChildEntity | undefined> {
  const nxGroups = children
    .filter(isGroup)
    .filter((g) => hasAttribute(g, 'NX_class'));

  // Look for an `NXdata` child group first
  for (const g of nxGroups) {
    // eslint-disable-next-line no-await-in-loop -- need sequential awaits to avoid overfetching
    const attrs = await attrValuesStore.get(g);
    if (attrs.NX_class === 'NXdata') {
      return g;
    }
  }

  // Then for an `NXentry` child group
  for (const g of nxGroups) {
    // eslint-disable-next-line no-await-in-loop
    const attrs = await attrValuesStore.get(g);
    if (attrs.NX_class === 'NXentry') {
      return g;
    }
  }

  // Then for an `NXprocess` child group
  for (const g of nxGroups) {
    // eslint-disable-next-line no-await-in-loop
    const attrs = await attrValuesStore.get(g);
    if (attrs.NX_class === 'NXprocess') {
      return g;
    }
  }

  return undefined;
}
