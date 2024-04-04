import {
  assertDefined,
  assertNonNull,
  isNumericType,
} from '@h5web/shared/guards';
import type {
  Attribute,
  ChildEntity,
  DType,
  Group,
  ProvidedEntity,
  Shape,
} from '@h5web/shared/hdf5-models';
import {
  DTypeClass,
  Endianness,
  EntityKind,
  H5TClass,
} from '@h5web/shared/hdf5-models';
import {
  arrayType,
  bitfieldType,
  buildEntityPath,
  compoundOrCplxType,
  enumOrBoolType,
  floatType,
  intOrUintType,
  opaqueType,
  referenceType,
  strType,
  timeType,
  toCharSet,
  unknownType,
} from '@h5web/shared/hdf5-utils';
import type { Metadata } from 'h5wasm';
import {
  BrokenSoftLink as H5WasmSoftLink,
  Dataset as H5WasmDataset,
  Datatype as H5WasmDatatype,
  ExternalLink as H5WasmExternalLink,
  Group as H5WasmGroup,
} from 'h5wasm';

import type { H5WasmAttributes, H5WasmEntity, HDF5Diag } from './models';

// https://github.com/h5wasm/h5wasm-plugins#included-plugins
export enum Plugin {
  Bitshuffle = 'bshuf',
  Blosc = 'blosc',
  Blosc2 = 'blosc2',
  BZIP2 = 'bz2',
  LZ4 = 'lz4',
  LZF = 'lzf',
  SZ = 'szf',
  ZFP = 'zfp',
  Zstandard = 'zstd',
}

// https://support.hdfgroup.org/services/contributions.html
export const PLUGINS_BY_FILTER_ID: Record<number, Plugin> = {
  307: Plugin.BZIP2,
  32_000: Plugin.LZF,
  32_001: Plugin.Blosc,
  32_004: Plugin.LZ4,
  32_008: Plugin.Bitshuffle,
  32_013: Plugin.ZFP,
  32_015: Plugin.Zstandard,
  32_017: Plugin.SZ,
  32_026: Plugin.Blosc2,
};

export function parseEntity(
  name: string,
  path: string,
  h5wEntity: H5WasmEntity,
  isChild: true,
): ChildEntity;

export function parseEntity(
  name: string,
  path: string,
  h5wEntity: H5WasmEntity,
  isChild?: false,
): ProvidedEntity;

export function parseEntity(
  name: string,
  path: string,
  h5wEntity: H5WasmEntity,
  isChild = false,
): ProvidedEntity | ChildEntity {
  const baseEntity = { name, path };

  if (h5wEntity instanceof H5WasmGroup) {
    const baseGroup: Group = {
      ...baseEntity,
      kind: EntityKind.Group,
      attributes: parseAttributes(h5wEntity.attrs),
    };

    if (isChild) {
      return baseGroup;
    }

    return {
      ...baseGroup,
      children: h5wEntity.keys().map((childName) => {
        const h5wChild = h5wEntity.get(childName);

        const childPath = buildEntityPath(path, childName);
        return parseEntity(childName, childPath, h5wChild, true);
      }),
    };
  }

  if (h5wEntity instanceof H5WasmDataset) {
    const { metadata, filters } = h5wEntity;
    const { chunks, maxshape, shape, ...rawType } = metadata; // keep `rawType` concise

    return {
      ...baseEntity,
      kind: EntityKind.Dataset,
      shape: metadata.shape,
      type: parseDType(metadata),
      chunks: metadata.chunks ?? undefined,
      filters,
      attributes: parseAttributes(h5wEntity.attrs),
      rawType,
    };
  }

  if (h5wEntity instanceof H5WasmSoftLink) {
    return {
      ...baseEntity,
      attributes: [],
      kind: EntityKind.Unresolved,
      link: {
        class: 'Soft',
        path: h5wEntity.target,
      },
    };
  }

  if (h5wEntity instanceof H5WasmExternalLink) {
    return {
      ...baseEntity,
      attributes: [],
      kind: EntityKind.Unresolved,
      link: {
        class: 'External',
        path: h5wEntity.obj_path,
        file: h5wEntity.filename,
      },
    };
  }

  return {
    ...baseEntity,
    attributes: [],
    kind:
      h5wEntity instanceof H5WasmDatatype
        ? EntityKind.Datatype
        : EntityKind.Unresolved,
  };
}

function parseAttributes(h5wAttrs: H5WasmAttributes): Attribute[] {
  return Object.entries(h5wAttrs).map(([name, attr]) => {
    const { shape, metadata } = attr;
    return {
      name,
      shape: shape as Shape,
      type: parseDType(metadata),
    };
  });
}

export function parseDType(metadata: Metadata): DType {
  const { type: h5tClass, size } = metadata;

  if (h5tClass === H5TClass.Integer) {
    const { signed, littleEndian } = metadata;
    return intOrUintType(signed, size * 8, toEndianness(littleEndian));
  }
  if (h5tClass === H5TClass.Float) {
    const { littleEndian } = metadata;
    return floatType(size * 8, toEndianness(littleEndian));
  }

  if (h5tClass === H5TClass.Time) {
    return timeType();
  }

  if (h5tClass === H5TClass.String) {
    const { cset, vlen } = metadata;
    return strType(toCharSet(cset), vlen ? undefined : size);
  }

  if (h5tClass === H5TClass.Bitfield) {
    return bitfieldType();
  }

  if (h5tClass === H5TClass.Opaque) {
    return opaqueType();
  }

  if (h5tClass === H5TClass.Compound) {
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

  if (h5tClass === H5TClass.Reference) {
    return referenceType();
  }

  if (h5tClass === H5TClass.Enum) {
    const { enum_type } = metadata;
    assertDefined(enum_type);
    const { members, type } = enum_type;

    const baseType = parseDType({ ...metadata, type });
    if (!isNumericType(baseType)) {
      throw new TypeError('Expected enum type to have numeric base type');
    }

    return enumOrBoolType(baseType, members);
  }

  if (h5tClass === H5TClass.Vlen) {
    // Not currently provided, so unable to know base type
    // const { array_type } = metadata;
    // assertDefined(array_type);
    return arrayType(unknownType());
  }

  if (h5tClass === H5TClass.Array) {
    const { array_type } = metadata;
    assertDefined(array_type);
    assertNonNull(array_type.shape);
    return arrayType(parseDType(array_type), array_type.shape);
  }

  return unknownType();
}

function toEndianness(littleEndian: boolean): Endianness {
  return littleEndian ? Endianness.LE : Endianness.BE;
}

export function readSelectedValue(
  h5wDataset: H5WasmDataset,
  selection: string | undefined,
) {
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

export function hasBigInts(type: DType): boolean {
  if (type.class === DTypeClass.Array || type.class === DTypeClass.Enum) {
    return hasBigInts(type.base);
  }

  if (type.class === DTypeClass.Compound) {
    return Object.values(type.fields).some(hasBigInts);
  }

  return (
    (type.class === DTypeClass.Integer || type.class === DTypeClass.Unsigned) &&
    type.size === 64
  );
}

export function sanitizeBigInts(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sanitizeBigInts);
  }

  if (value instanceof BigInt64Array || value instanceof BigUint64Array) {
    return [...value].map(Number);
  }

  if (typeof value === 'bigint') {
    return Number(value);
  }

  return value;
}

const DIAG_PREDICATES: ((diag: HDF5Diag) => boolean)[] = [
  (diag: HDF5Diag) => {
    return (
      diag.major === 'Data filters' &&
      /^required filter.*not registered$/iu.test(diag.message)
    );
  },
];

export function getEnhancedError(error: unknown): unknown {
  if (!(error instanceof Error) || !error.message.startsWith('HDF5-DIAG')) {
    return error;
  }

  const diagnostics = parseDiagnostics(error.message);
  const opts = { cause: error };

  for (const predicate of DIAG_PREDICATES) {
    const diag = diagnostics.find(predicate);
    if (diag) {
      return new Error(diag.message, opts);
    }
  }

  return new Error('Error detected in HDF5', opts);
}

const MESSAGE_LINE_REGEX = /#\d{3}: (\/.+ line \d+ in .+\(\)): (.+)$/u;
const MAJOR_LINE_REGEX = /major: (.+)$/u;
const MINOR_LINE_REGEX = /minor: (.+)$/u;

/* Each HDF5 diagnostic entry is made up of three lines:
 * 1. "#000: <origin>: <message>"
 * 2. "major: <major>"
 * 3. "major: <minor>"
 */
export function parseDiagnostics(msg: string): HDF5Diag[] {
  // Ignore first line (generic error) and last line (empty)
  const lines = msg.split(/\n/u).slice(1, -1);

  if (lines.length % 3 !== 0) {
    return [];
  }

  const diags: HDF5Diag[] = [];
  for (let i = 0; i < lines.length; i += 3) {
    const [, origin, message] = MESSAGE_LINE_REGEX.exec(lines[i]) || [];
    const [, major] = MAJOR_LINE_REGEX.exec(lines[i + 1]) || [];
    const [, minor] = MINOR_LINE_REGEX.exec(lines[i + 2]) || [];

    if (origin && message && major && minor) {
      diags.push({
        major,
        minor,
        message: `${message.charAt(0).toUpperCase()}${message.slice(1)}`,
        origin,
      });
    }
  }

  return diags;
}
