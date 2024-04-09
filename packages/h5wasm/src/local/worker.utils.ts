import type {
  Attribute,
  ChildEntity,
  Group,
  ProvidedEntity,
} from '@h5web/shared/hdf5-models';
import { EntityKind } from '@h5web/shared/hdf5-models';
import { buildEntityPath, getNameFromPath } from '@h5web/shared/hdf5-utils';
import { ready as h5wasmReady, ready } from 'h5wasm';

import { parseDType } from '../utils';

export async function initH5Wasm(pluginsPath: string): typeof ready {
  const module = await ready;

  // Throw HDF5 errors instead of just logging them
  module.activate_throwing_error_handler();

  // Replace default plugins path
  module.remove_plugin_search_path(0);
  module.insert_plugin_search_path(pluginsPath, 0);

  // Create plugins folder on Emscripten virtual file system
  module.FS.mkdirTree(pluginsPath);

  return module;
}

export async function mountWorkerFS(mountPt: string) {
  const { FS } = await h5wasmReady;
  const { WORKERFS } = FS.filesystems;

  FS.mkdir(mountPt);
  return FS.mount(WORKERFS as FS.FileSystemType, {}, mountPt);
}

export function parseEntity(
  h5wasm: Awaited<typeof h5wasmReady>,
  fileId: bigint,
  path: string,
  isChild: true,
): ChildEntity;

export function parseEntity(
  h5wasm: Awaited<typeof h5wasmReady>,
  fileId: bigint,
  path: string,
  isChild?: false,
): ProvidedEntity;

export function parseEntity(
  h5wasm: Awaited<typeof h5wasmReady>,
  fileId: bigint,
  path: string,
  isChild = false,
): ProvidedEntity | ChildEntity {
  const baseEntity = { name: getNameFromPath(path), path, attributes: [] };

  const kind = h5wasm.get_type(fileId, path);

  if (kind === h5wasm.H5G_GROUP) {
    const baseGroup: Group = {
      ...baseEntity,
      kind: EntityKind.Group,
      attributes: parseAttributes(h5wasm, fileId, path),
    };

    if (isChild) {
      return baseGroup;
    }

    const childrenNames = h5wasm.get_names(fileId, path, false);
    return {
      ...baseGroup,
      children: childrenNames.map((childName) =>
        parseEntity(h5wasm, fileId, buildEntityPath(path, childName), true),
      ),
    };
  }

  if (kind === h5wasm.H5G_DATASET) {
    const metadata = h5wasm.get_dataset_metadata(fileId, path);
    const { chunks, maxshape, shape, ...rawType } = metadata; // keep `rawType` concise

    return {
      ...baseEntity,
      kind: EntityKind.Dataset,
      shape: metadata.shape,
      type: parseDType(metadata),
      chunks: metadata.chunks ?? undefined,
      filters: h5wasm.get_dataset_filters(fileId, path),
      attributes: parseAttributes(h5wasm, fileId, path),
      rawType,
    };
  }

  if (kind === h5wasm.H5G_TYPE) {
    const metadata = h5wasm.get_dataset_metadata(fileId, path);
    const { chunks, maxshape, shape, ...rawType } = metadata; // keep `rawType` concise

    return {
      ...baseEntity,
      kind: EntityKind.Datatype,
      type: parseDType(metadata),
      attributes: parseAttributes(h5wasm, fileId, path),
      rawType,
    };
  }

  if (kind === h5wasm.H5G_LINK) {
    const target = h5wasm.get_symbolic_link(fileId, path);
    return {
      ...baseEntity,
      kind: EntityKind.Unresolved,
      link: {
        class: 'Soft',
        path: target,
      },
    };
  }

  if (kind === h5wasm.H5G_UDLINK) {
    const extLink = h5wasm.get_external_link(fileId, path);
    return {
      ...baseEntity,
      kind: EntityKind.Unresolved,
      link: {
        class: 'External',
        file: extLink.filename,
        path: extLink.obj_path,
      },
    };
  }

  return {
    ...baseEntity,
    kind: EntityKind.Unresolved,
  };
}

function parseAttributes(
  h5wasm: Awaited<typeof h5wasmReady>,
  fileId: bigint,
  path: string,
): Attribute[] {
  const names = h5wasm.get_attribute_names(fileId, path);

  return names.map((name) => {
    const metadata = h5wasm.get_attribute_metadata(fileId, path, name);
    return {
      name,
      shape: metadata.shape,
      type: parseDType(metadata),
    };
  });
}
