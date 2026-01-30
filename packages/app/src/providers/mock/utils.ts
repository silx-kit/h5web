import {
  assertAbsolutePath,
  assertGroup,
  assertGroupWithChildren,
  isGroup,
} from '@h5web/shared/guards';
import {
  type ArrayShape,
  type Dataset,
  type DType,
  type GroupWithChildren,
  type ProvidedEntity,
  type ScalarShape,
  type ScalarValue,
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

export function sliceValue<T extends DType>(
  value: unknown,
  dataset: Dataset<ArrayShape | ScalarShape, T>,
  selection: string,
): ScalarValue<T>[] {
  const { dims } = dataset.shape;
  const dataArray = ndarray(value as ScalarValue<typeof dataset.type>[], dims);

  const slicingState = selection
    .split(',')
    .map((s) => (s === ':' ? null : Number.parseInt(s)));

  return createArrayFromView(dataArray.pick(...slicingState)).data;
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

export async function cancellableDelay(
  abortSignal: AbortSignal,
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      abortSignal.removeEventListener('abort', handleAbort);
      resolve();
    }, SLOW_TIMEOUT);

    function handleAbort() {
      clearTimeout(timeout);
      abortSignal.removeEventListener('abort', handleAbort);
      reject(abortSignal.reason); // eslint-disable-line @typescript-eslint/prefer-promise-reject-errors
    }

    abortSignal.addEventListener('abort', handleAbort);
  });
}
