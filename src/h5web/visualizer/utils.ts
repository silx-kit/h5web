import type { FetchStore } from 'react-suspense-fetch';
import { assertDefined, assertStr } from '../guards';
import type { Entity } from '../providers/models';
import { buildEntityPath } from '../utils';
import { VIS_DEFS, Vis } from '../visualizations';
import { getAttributeValue } from '../visualizations/nexus/utils';

const REDUNDANT_VIS = new Set([Vis.Raw, Vis.NxSpectrum]);

function removeRedundantVis(visArr: Vis[]): Vis[] {
  if (REDUNDANT_VIS.has(visArr[0]) && visArr.length > 1) {
    return visArr.slice(1);
  }

  return visArr;
}

export function getSupportedVis(entity: Entity): Vis[] {
  const supportedVis = Object.entries(VIS_DEFS).reduce<Vis[]>(
    (arr, visDefEntry) => {
      const [vis, { supportsEntity }] = visDefEntry;
      return supportsEntity(entity) ? [...arr, vis as Vis] : arr;
    },
    []
  );

  return removeRedundantVis(supportedVis);
}

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

  const defaultEntity = entitiesStore.get(path);
  assertDefined(defaultEntity, `Expected entity at path "${path}"`);

  return getDefaultEntity(defaultEntity, entitiesStore);
}
