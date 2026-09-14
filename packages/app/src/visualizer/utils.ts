import { isDataset, isDefined, isGroup } from '@h5web/shared/guards';
import {
  type ChildEntity,
  type Dataset,
  type Group,
  type ProvidedEntity,
} from '@h5web/shared/hdf5-models';
import { buildEntityPath } from '@h5web/shared/hdf5-utils';
import { queryOptions } from '@tanstack/react-query';

import { type DataContextValue } from '../providers/DataProvider';
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

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function resolvePathQuery(path: string, dataContext: DataContextValue) {
  return queryOptions({
    queryKey: [dataContext.filepath, 'resolution', path] as const,
    queryFn: async () => resolvePath(path, dataContext),
  });
}

async function resolvePath(
  path: string,
  dataContext: DataContextValue,
): Promise<{
  entity: ProvidedEntity;
  supportedVis: VisDef[];
  primaryVis?: VisDef;
} | null> {
  const { queryClient, queries } = dataContext;
  const entity = await queryClient.query(queries.entity(path));

  if (isDataset(entity)) {
    const supportedVis = await getSupportedCoreVis(entity, dataContext);
    return supportedVis.length > 0 ? { entity, supportedVis } : null;
  }

  if (!isGroup(entity)) {
    return null;
  }

  if (await isNxNoteGroup(entity, dataContext)) {
    return { entity, supportedVis: [NX_NOTE_VIS] };
  }

  if (await isNxDataGroup(entity, dataContext)) {
    const signal = await findSignalDataset(entity, dataContext);

    const interpretationAttr = findScalarStrAttr(signal, 'interpretation');
    const interpretation = await getAttributeValue(
      signal,
      interpretationAttr,
      dataContext,
    );

    const results = await Promise.all(
      Object.values(NX_DATA_VIS).map(async (vis) => {
        const supported = await vis.supports(
          entity,
          signal,
          interpretation,
          dataContext,
        );
        return supported ? vis : undefined;
      }),
    );

    const supportedVis = results.filter(isDefined);
    if (supportedVis.length > 0) {
      return {
        entity,
        supportedVis,
        primaryVis: supportedVis.find((v) => v.isPrimary(interpretation)),
      };
    }
  }

  const nxDefaultPath =
    (await getNxDefaultPath(entity, dataContext)) ||
    (await getImplicitNxDefaultPath(entity.children, dataContext));

  if (!nxDefaultPath) {
    return null;
  }

  return dataContext.queryClient.query(
    resolvePathQuery(nxDefaultPath, dataContext),
  );
}

async function getSupportedCoreVis(
  dataset: Dataset,
  dataContext: DataContextValue,
): Promise<CoreVisDef[]> {
  const results = await Promise.all(
    Object.values(CORE_VIS).map(async (vis) => {
      return (await vis.supportsDataset(dataset, dataContext))
        ? vis
        : undefined;
    }),
  );

  const supportedVis = results.filter(isDefined);

  // Remove `Scalar` vis unless it's the only supported vis
  return supportedVis.length > 1
    ? supportedVis.filter((vis) => vis.name !== Vis.Scalar)
    : supportedVis;
}

export async function getNxDefaultPath(
  group: Group,
  dataContext: DataContextValue,
): Promise<string | undefined> {
  const defaultAttr = findScalarStrAttr(group, 'default');
  if (!defaultAttr) {
    return undefined;
  }

  const defaultPath = await getAttributeValue(group, defaultAttr, dataContext);
  return defaultPath.startsWith('/')
    ? defaultPath
    : buildEntityPath(group.path, defaultPath);
}

async function getImplicitNxDefaultPath(
  children: ChildEntity[],
  dataContext: DataContextValue,
): Promise<string | undefined> {
  let firstNxEntry: ChildEntity | undefined;
  let firstNxProcess: ChildEntity | undefined;

  for (const child of children) {
    if (!isGroup(child)) {
      continue;
    }

    // Use first `NXdata` child group
    const nxClass = await getNxClass(child, dataContext); // eslint-disable-line no-await-in-loop -- stop at first `NXdata` group found
    if (nxClass === 'NXdata') {
      return child.path;
    }

    if (nxClass === 'NXentry' && !firstNxEntry) {
      firstNxEntry = child;
    }

    if (nxClass === 'NXprocess' && !firstNxProcess) {
      firstNxProcess = child;
    }
  }

  // No `NXdata`; use first `NXentry` or `NXprocess` if any
  return (firstNxEntry || firstNxProcess)?.path;
}
