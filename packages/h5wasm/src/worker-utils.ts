import {
  assertDefined,
  assertNonNull,
  isBigIntTypedArray,
  isNumericType,
  isTypedArray,
} from '@h5web/shared/guards';
import { H5T_CLASS, H5T_ORDER } from '@h5web/shared/h5t';
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
  parseShape,
  referenceType,
  strType,
  timeType,
  unknownType,
  vlenType,
} from '@h5web/shared/hdf5-utils';
import { type BigIntTypedArray, type NumArray } from '@h5web/shared/vis-models';
import { SCALAR_SELECTION_REGEXP } from '@h5web/shared/vis-utils';
import {
  type Dataset as H5WasmDataset,
  type Metadata,
  ready as h5wasmReady,
} from 'h5wasm';
import { nanoid } from 'nanoid';

import { type LazyFile } from './lazy-file';

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

let lastReadError: unknown; // cause of last failed read of a lazy file, if any

/* Report the actual cause of failed reads of lazy files (e.g. network error,
 * file changed on server, etc.) instead of the generic HDF5 error. */
export function withReadErrors<T>(fn: () => T): T {
  lastReadError = undefined;

  try {
    return fn();
  } catch (error) {
    throw lastReadError ?? error;
  }
}

/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
export function createLazyFileNode(
  FS: FS.FileSystemType,
  rootNode: unknown,
  fileName: string,
  lazyFile: LazyFile,
): () => void {
  const { WORKERFS } = FS.filesystems;
  const { ErrnoError, destroyNode } = FS as unknown as {
    ErrnoError: new (errno: number) => Error;
    destroyNode: (node: unknown) => void;
  };

  // Create read-only file node with WORKERFS, then override its `read` operation
  const node = WORKERFS.createNode(
    rootNode,
    fileName,
    WORKERFS.FILE_MODE,
    0,
    lazyFile, // WORKERFS only uses `size` when creating the node
  );

  node.stream_ops = {
    ...WORKERFS.stream_ops,
    read(
      _: unknown,
      buffer: Int8Array,
      offset: number,
      length: number,
      position: number,
    ): number {
      try {
        const bytes = new Uint8Array(buffer.buffer, buffer.byteOffset);
        return lazyFile.read(bytes, offset, length, position);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        lastReadError = error;
        throw new ErrnoError(29); // EIO - lets HDF5 fail gracefully
      }
    },
  };

  // WORKERFS doesn't support unlinking files, so remove node manually
  return () => {
    destroyNode(node);
    delete node.parent.contents[fileName]; // eslint-disable-line @typescript-eslint/no-dynamic-delete
  };
}
/* eslint-enable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

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
      shape: parseShape(shape),
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
      shape: parseShape(metadata.shape),
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
    return strType(cset, strpad, vlen ? undefined : size);
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
      compound_type.members.map(({ name, ...mType }) => [
        name,
        parseDType(mType),
      ]),
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
    return vlenType(parseDType(vlen_type));
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

type TypedArray = Exclude<NumArray, number[]> | BigIntTypedArray;

export const SLAB_SIZE = 32 * 1024 * 1024; // in bytes

/* Read large numeric selections slab by slab (along their first dimension) into a single
 * typed array, so the WebAssembly heap doesn't need to grow to the size of the entire
 * selection (it never shrinks back) and only a small buffer is copied out of it at a time. */
export function readInSlabs(
  h5wDataset: H5WasmDataset,
  ranges: [number, number][],
  slabSize = SLAB_SIZE,
): TypedArray | undefined {
  const { type, size, chunks } = h5wDataset.metadata;
  /* eslint-disable @typescript-eslint/no-unsafe-enum-comparison -- h5wasm types the class as a plain number */
  if (type !== H5T_CLASS.INTEGER && type !== H5T_CLASS.FLOAT) {
    return undefined;
  }
  /* eslint-enable @typescript-eslint/no-unsafe-enum-comparison */

  const [[start, stop], ...otherRanges] = ranges;
  const count = stop - start;
  const slabItems = otherRanges.reduce((acc, [a, b]) => acc * (b - a), 1);

  // Indices along first dimension per slab, in whole chunks so each chunk is read (and fetched) once
  const chunkCount = chunks?.[0] ?? 1;
  const slabCount =
    chunkCount *
    Math.max(1, Math.floor(slabSize / (slabItems * size * chunkCount)));

  if (count <= slabCount || slabItems === 0) {
    return undefined; // selection fits in a single slab
  }

  let output: TypedArray | undefined;
  for (let i = start; i < stop;) {
    const slabStop = Math.min(i + slabCount - (i % chunkCount), stop); // align slabs with chunks
    const slab = h5wDataset.slice([[i, slabStop], ...otherRanges]);

    if (!isTypedArray(slab) && !isBigIntTypedArray(slab)) {
      return undefined; // let caller read selection in one go (only happens on first slab)
    }

    if (!output) {
      const Constructor = slab.constructor as new (
        length: number,
      ) => TypedArray;
      output = new Constructor(count * slabItems);
    }

    // `set` is typed per array type, but `output` is always of the same type as `slab`
    (output as Float64Array).set(slab as Float64Array, (i - start) * slabItems);
    i = slabStop;
  }

  return output;
}

export function readSelectedValue(
  h5wDataset: H5WasmDataset,
  selection: string | undefined,
): unknown {
  const { shape } = h5wDataset;

  if (!selection) {
    return (
      (shape?.length &&
        readInSlabs(
          h5wDataset,
          shape.map((dim) => [0, dim]),
        )) ||
      h5wDataset.value
    );
  }

  assertNonNull(shape);

  const selectionMembers = selection.split(',');
  const ranges = selectionMembers.map<[number, number]>((member, i) => {
    if (member === ':') {
      return [0, shape[i]];
    }

    return [Number(member), Number(member) + 1];
  });

  const slicedValue =
    readInSlabs(h5wDataset, ranges) ?? h5wDataset.slice(ranges);

  /* h5wasm unwraps scalar slices inconsistently - e.g. it does so for opaque
   * datasets but not for compound, vlen, etc. */
  if (SCALAR_SELECTION_REGEXP.test(selection) && Array.isArray(slicedValue)) {
    return slicedValue[0];
  }

  return slicedValue;
}
