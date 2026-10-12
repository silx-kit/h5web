import {
  assertGroup,
  assertGroupWithChildren,
  hasNonNullShape,
  isDataset,
  isGroup,
} from '@h5web/shared/guards';
import {
  type Dataset,
  type Entity,
  type Group,
} from '@h5web/shared/hdf5-models';

import { type DataProviderApi } from './api';

const EXCLUDED_KEYS = new Set(['id', 'rawType']);

export async function getGroupSnapshot(
  api: DataProviderApi,
  path: string,
  processValue: (val: unknown, d: Dataset) => unknown = (val) => val,
): Promise<Partial<Group> & { children: unknown[] }> {
  const group = await api.getEntity(path);
  assertGroup(group);
  assertGroupWithChildren(group);

  const children = await Promise.all(
    group.children.map(async (child) => {
      if (isGroup(child)) {
        return getGroupSnapshot(api, child.path, processValue);
      }

      if (isDataset(child)) {
        try {
          const value = hasNonNullShape(child)
            ? await api.getValue(child)
            : null;

          return { ...cleanEntity(child), value: processValue(value, child) };
        } catch (error) {
          return error instanceof Error ? error.message : error;
        }
      }

      return cleanEntity(child);
    }),
  );

  return { ...cleanEntity(group), children };
}

function cleanEntity<T extends Entity>(entity: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(entity).filter(([k, v]) => {
      return (
        !EXCLUDED_KEYS.has(k) &&
        v !== undefined &&
        !(Array.isArray(v) && v.length === 0)
      );
    }),
  ) as Partial<T>;
}
