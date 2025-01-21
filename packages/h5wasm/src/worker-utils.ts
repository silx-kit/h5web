import {
  assertDefined,
  assertNonNull,
  isNumericType,
} from '@h5web/shared/guards';
import { H5T_CLASS, H5T_ORDER, type H5T_STR } from '@h5web/shared/h5t';
import {
  type Attribute,
  type ChildEntity,
  type DType,
  EntityKind,
  type Group,
  type ProvidedEntity,
  type VirtualSource,
} from '@h5web/shared/hdf5-models';
import {
  arrayType,
  bitfieldType,
  buildEntityPath,
  compoundOrCplxType,
  enumOrBoolType,
  floatType,
  getNameFromPath,
  intType,
  opaqueType,
  referenceType,
  strType,
  timeType,
  unknownType,
} from '@h5web/shared/hdf5-utils';
import {
  type Dataset as H5WasmDataset,
  type Metadata,
  type OutputData,
  ready as h5wasmReady,
} from 'h5wasm';
import { nanoid } from 'nanoid';

export const PLUGINS_FOLDER = 'plugins'; // path to plugins on EMScripten virtual file system
export const WORKERFS_FOLDER = 'workerfs';

export async function initH5Wasm(): typeof h5wasmReady {
  const module = await h5wasmReady;

  // Throw HDF5 errors instead of just logging them
  module.activate_throwing_error_handler();

  // Replace default plugins path
  module.remove_plugin_search_path(0);
  module.insert_plugin_search_path(`/${PLUGINS_FOLDER}`, 0);

  // Create plugins folder on Emscripten virtual file system
  module.FS.mkdirTree(PLUGINS_FOLDER);

  return module;
}

let workerFSRootNode: unknown;

export async function mountWorkerFS(
  h5wasm: Awaited<typeof h5wasmReady>,
): Promise<unknown> {
  if (workerFSRootNode !== undefined) {
    return workerFSRootNode;
  }

  const { FS } = h5wasm;
  const { WORKERFS } = FS.filesystems;

  FS.mkdir(WORKERFS_FOLDER);
  workerFSRootNode = FS.mount(
    WORKERFS as FS.FileSystemType,
    {},
    WORKERFS_FOLDER,
  );

  return workerFSRootNode;
}

export function getAvailableFileName(
  FS: FS.FileSystemType,
  mountPt = '',
): string {
  const fileName = nanoid();
  const filePath = `${mountPt && `${mountPt}/`}${fileName}`;
  return FS.analyzePath(filePath).exists
    ? getAvailableFileName(FS, mountPt)
    : fileName;
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
    const { chunks, maxshape, shape, virtual_sources, ...rawType } = metadata; // keep `rawType` concise

    return {
      ...baseEntity,
      kind: EntityKind.Dataset,
      shape,
      type: parseDType(metadata),
      chunks: chunks ?? undefined,
      filters: h5wasm.get_dataset_filters(fileId, path),
      virtualSources: parseVirtualSources(metadata),
      attributes: parseAttributes(h5wasm, fileId, path),
      rawType,
    };
  }

  if (kind === h5wasm.H5G_TYPE) {
    const metadata = h5wasm.get_datatype_metadata(fileId, path);
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

/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
function parseDType(metadata: Metadata): DType {
  const { type: h5tClass, size } = metadata;

  if (h5tClass === H5T_CLASS.INTEGER) {
    const { signed, littleEndian } = metadata;
    return intType(
      signed,
      size * 8,
      littleEndian ? H5T_ORDER.LE : H5T_ORDER.BE,
    );
  }
  if (h5tClass === H5T_CLASS.FLOAT) {
    const { littleEndian } = metadata;
    return floatType(size * 8, littleEndian ? H5T_ORDER.LE : H5T_ORDER.BE);
  }

  if (h5tClass === H5T_CLASS.TIME) {
    return timeType();
  }

  if (h5tClass === H5T_CLASS.STRING) {
    const { cset, strpad, vlen } = metadata;
    return strType(cset, strpad as H5T_STR, vlen ? undefined : size);
  }

  if (h5tClass === H5T_CLASS.BITFIELD) {
    return bitfieldType();
  }

  if (h5tClass === H5T_CLASS.OPAQUE) {
    return opaqueType();
  }

  if (h5tClass === H5T_CLASS.COMPOUND) {
    const { compound_type } = metadata;
    assertDefined(compound_type);

    return compoundOrCplxType(
      Object.fromEntries(
        compound_type.members.map((member) => [
          member.name,
          parseDType(member),
        ]),
      ),
    );
  }

  if (h5tClass === H5T_CLASS.REFERENCE) {
    return referenceType();
  }

  if (h5tClass === H5T_CLASS.ENUM) {
    const { enum_type } = metadata;
    assertDefined(enum_type);
    const { members, type } = enum_type;

    const baseType = parseDType({ ...metadata, type });
    if (!isNumericType(baseType)) {
      throw new TypeError('Expected enum type to have numeric base type');
    }

    return enumOrBoolType(baseType, members);
  }

  if (h5tClass === H5T_CLASS.VLEN) {
    const { vlen_type } = metadata;
    assertDefined(vlen_type);
    return arrayType(parseDType(vlen_type));
  }

  if (h5tClass === H5T_CLASS.ARRAY) {
    const { array_type } = metadata;
    assertDefined(array_type);
    assertNonNull(array_type.shape);
    return arrayType(parseDType(array_type), array_type.shape);
  }

  return unknownType();
}
/* eslint-enable @typescript-eslint/no-unsafe-enum-comparison */

function parseVirtualSources(metadata: Metadata): VirtualSource[] | undefined {
  return metadata.virtual_sources?.map(({ file_name, dset_name }) => ({
    file: file_name,
    path: dset_name,
  }));
}

export function readSelectedValue(
  h5wDataset: H5WasmDataset,
  selection: string | undefined,
): OutputData | null {
  if (!selection) {
    return h5wDataset.value;
  }

  const { shape } = h5wDataset;
  assertNonNull(shape);

  const selectionMembers = selection.split(',');
  const ranges = selectionMembers.map<[number, number]>((member, i) => {
    if (member === ':') {
      return [0, shape[i]];
    }

    return [Number(member), Number(member) + 1];
  });

  return h5wDataset.slice(ranges);
}
