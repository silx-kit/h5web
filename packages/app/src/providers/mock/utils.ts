import {
  assertAbsolutePath,
  assertGroup,
  assertGroupWithChildren,
  isGroup,
} from '@h5web/shared/guards';
import type {
  ArrayShape,
  Dataset,
  DType,
  GroupWithChildren,
  Primitive,
  ProvidedEntity,
  ScalarShape,
} from '@h5web/shared/hdf5-models';
import { getChildEntity } from '@h5web/shared/hdf5-utils';
import ndarray from 'ndarray';

import { applyMapping } from '../../vis-packs/core/utils';

export const SLOW_TIMEOUT = 3000;

export function findMockEntity(
  group: GroupWithChildren,
  path: string,
): ProvidedEntity | undefined {
  assertAbsolutePath(path);

  if (path === '/') {
    return group;
  }

  const parentPath = path.slice(0, path.lastIndexOf('/')) || '/';
  const parent = findMockEntity(group, parentPath);
  if (!parent) {
    return undefined;
  }

  assertGroup(parent);
  const childName = path.slice(path.lastIndexOf('/') + 1);
  const child = parent && getChildEntity(parent, childName);

  if (child && isGroup(child)) {
    assertGroupWithChildren(child);
  }
  return child;
}

export function sliceValue<T extends DType>(
  value: unknown,
  dataset: Dataset<ArrayShape | ScalarShape, T>,
  selection: string,
): Primitive<T>[] {
  const { shape, type } = dataset;
  const dataArray = ndarray(value as Primitive<typeof type>[], shape);
  const mappedArray = applyMapping(
    dataArray,
    selection.split(',').map((s) => (s === ':' ? s : Number.parseInt(s, 10))),
  );

  return mappedArray.data;
}

export function getChildrenPaths(
  mockFile: GroupWithChildren,
  entityPath: string,
): string[] {
  const entity = findMockEntity(mockFile, entityPath);
  if (!entity) {
    return [];
  }

  if (!isGroup(entity)) {
    return [entity.path];
  }

  return entity.children.reduce<string[]>(
    (acc, child) => [...acc, ...getChildrenPaths(mockFile, child.path)],
    [entity.path],
  );
}

export async function cancellableDelay(signal?: AbortSignal) {
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      signal?.removeEventListener('abort', handleAbort);
      resolve();
    }, SLOW_TIMEOUT);

    function handleAbort() {
      clearTimeout(timeout);
      signal?.removeEventListener('abort', handleAbort);
      reject(
        new Error(
          typeof signal?.reason === 'string' ? signal.reason : 'cancelled',
        ),
      );
    }

    signal?.addEventListener('abort', handleAbort);
  });
}
