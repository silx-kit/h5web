import {
  assertAbsolutePath,
  assertGroup,
  assertGroupWithChildren,
  isGroup,
  isScalarSelection,
} from '@h5web/shared/guards';
import {
  type ArrayShape,
  type Dataset,
  type GroupWithChildren,
  type ProvidedEntity,
} from '@h5web/shared/hdf5-models';
import { getChildEntity } from '@h5web/shared/hdf5-utils';
import { createArrayFromView } from '@h5web/shared/vis-utils';
import ndarray from 'ndarray';

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
  const child = getChildEntity(parent, childName);

  if (child && isGroup(child)) {
    assertGroupWithChildren(child);
  }
  return child;
}

export function sliceValue(
  value: unknown[],
  dataset: Dataset<ArrayShape>,
  selection: string,
): unknown {
  const { shape } = dataset;
  const dataArray = ndarray(value, shape);

  const slicingState = selection
    .split(',')
    .map((val) => (val === ':' ? null : Number.parseInt(val)));

  const slicedView = dataArray.pick(...slicingState);
  const slicedArray = createArrayFromView(slicedView);

  return isScalarSelection(selection) ? slicedArray.get(0) : slicedArray.data;
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

export async function cancellableDelay(signal?: AbortSignal): Promise<void> {
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
